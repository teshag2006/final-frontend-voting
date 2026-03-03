import * as dotenv from 'dotenv';
import * as path from 'path';
import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from './src/config/database.config';
import { ConfigService } from '@nestjs/config';

dotenv.config({ path: path.join(__dirname, '.env') });

async function tableExists(dataSource: DataSource, table: string): Promise<boolean> {
  const rows = await dataSource.query(`SELECT to_regclass($1) AS rel`, [`public.${table}`]);
  return Boolean(rows?.[0]?.rel);
}

async function firstEnumValue(
  qr: any,
  enumName: string,
  fallback: string,
): Promise<string> {
  const rows = await qr.query(
    `
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = $1
    ORDER BY e.enumsortorder
    LIMIT 1
    `,
    [enumName],
  );
  return rows?.[0]?.enumlabel ?? fallback;
}

function quoteIdent(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function quoteLiteral(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  const s = String(value).replace(/'/g, "''");
  return `'${s}'`;
}

type ColumnMeta = {
  column_name: string;
  data_type: string;
  udt_name: string;
  character_maximum_length: number | null;
  is_nullable: 'YES' | 'NO';
  column_default: string | null;
  is_identity: 'YES' | 'NO';
  is_generated: 'NEVER' | 'ALWAYS';
};

type FkMeta = {
  column_name: string;
  foreign_table: string;
  foreign_column: string;
};

async function getTableColumns(qr: any, table: string): Promise<ColumnMeta[]> {
  return qr.query(
    `
    SELECT
      column_name,
      data_type,
      udt_name,
      character_maximum_length,
      is_nullable,
      column_default,
      is_identity,
      is_generated
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = $1
    ORDER BY ordinal_position
    `,
    [table],
  );
}

async function getTableFks(qr: any, table: string): Promise<FkMeta[]> {
  return qr.query(
    `
    SELECT
      kcu.column_name,
      ccu.table_name AS foreign_table,
      ccu.column_name AS foreign_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = $1
    `,
    [table],
  );
}

async function enumValueByTypeName(qr: any, enumType: string): Promise<string | null> {
  const rows = await qr.query(
    `
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = $1
    ORDER BY e.enumsortorder
    LIMIT 1
    `,
    [enumType],
  );
  return rows?.[0]?.enumlabel ?? null;
}

async function valueExprForColumn(
  qr: any,
  table: string,
  column: ColumnMeta,
  idx: number,
  fkMap: Map<string, FkMeta>,
): Promise<string> {
  const fk = fkMap.get(column.column_name);
  if (fk) {
    const rows = await qr.query(
      `SELECT ${quoteIdent(fk.foreign_column)} AS v FROM ${quoteIdent(fk.foreign_table)} LIMIT 1`,
    );
    if (!rows?.length) {
      throw new Error(
        `No referenced row in ${fk.foreign_table}.${fk.foreign_column} for FK ${table}.${column.column_name}`,
      );
    }
    const v = rows[0].v;
    if (v === null || v === undefined) {
      throw new Error(
        `Referenced NULL value for FK ${table}.${column.column_name} from ${fk.foreign_table}.${fk.foreign_column}`,
      );
    }
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    return quoteLiteral(v);
  }

  const dt = column.data_type.toLowerCase();
  const udt = column.udt_name.toLowerCase();

  if (column.column_name.toLowerCase() === 'vote_type') {
    return quoteLiteral('FREE');
  }

  if (dt === 'user-defined') {
    const ev = await enumValueByTypeName(qr, column.udt_name);
    if (ev !== null) {
      return `${quoteLiteral(ev)}::${quoteIdent(column.udt_name)}`;
    }
  }

  if (dt.includes('timestamp')) return 'NOW()';
  if (dt === 'date') return 'CURRENT_DATE';
  if (dt === 'time without time zone' || dt === 'time with time zone') return 'CURRENT_TIME';
  if (dt === 'boolean') return idx % 2 === 0 ? 'true' : 'false';
  if (
    dt === 'integer' ||
    dt === 'bigint' ||
    dt === 'smallint' ||
    dt === 'numeric' ||
    dt === 'real' ||
    dt === 'double precision'
  ) {
    return String(idx);
  }
  if (dt === 'json' || dt === 'jsonb') return `'{}'::${dt}`;
  if (dt === 'uuid') {
    const suffix = String(idx).padStart(12, '0');
    return quoteLiteral(`00000000-0000-0000-0000-${suffix}`);
  }
  if (dt === 'bytea') return `decode('00','hex')`;
  if (dt === 'inet') return quoteLiteral(`203.0.113.${10 + (idx % 200)}`);
  if (dt === 'cidr') return quoteLiteral('203.0.113.0/24');
  if (udt.endsWith('[]')) return `'{}'`;

  // Default textual fallback
  let textVal = `qa_${table}_${column.column_name}_${idx}`;
  if (column.character_maximum_length && column.character_maximum_length > 0) {
    textVal = textVal.slice(0, column.character_maximum_length);
  }
  return quoteLiteral(textVal);
}

async function insertGeneratedRow(qr: any, table: string, idx: number): Promise<void> {
  const columns = await getTableColumns(qr, table);
  const fks = await getTableFks(qr, table);
  const fkMap = new Map<string, FkMeta>();
  for (const fk of fks) fkMap.set(fk.column_name, fk);

  const requiredColumns = columns.filter(
    (c) =>
      c.is_identity !== 'YES' &&
      c.is_generated !== 'ALWAYS' &&
      c.is_nullable === 'NO' &&
      c.column_default === null,
  );

  if (requiredColumns.length === 0) {
    await qr.query(`INSERT INTO ${quoteIdent(table)} DEFAULT VALUES`);
    return;
  }

  const colSql: string[] = [];
  const valSql: string[] = [];
  for (const c of requiredColumns) {
    colSql.push(quoteIdent(c.column_name));
    valSql.push(await valueExprForColumn(qr, table, c, idx, fkMap));
  }

  await qr.query(
    `INSERT INTO ${quoteIdent(table)} (${colSql.join(', ')}) VALUES (${valSql.join(', ')})`,
  );
}

async function topUpAllBaseTables(qr: any, minRows: number): Promise<{
  completed: string[];
  failed: Array<{ table: string; count: number; error: string }>;
}> {
  const tables: Array<{ tablename: string }> = await qr.query(
    `
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> 'migrations'
    ORDER BY tablename
    `,
  );

  const failedMap = new Map<string, { count: number; error: string }>();

  for (let pass = 1; pass <= 12; pass++) {
    let progress = false;
    for (const t of tables) {
      const table = t.tablename;
      const countRows = await qr.query(`SELECT COUNT(*)::INT AS c FROM ${quoteIdent(table)}`);
      let count = Number(countRows?.[0]?.c || 0);
      while (count < minRows) {
        try {
          await qr.query(`SAVEPOINT sp_topup_row`);
          await insertGeneratedRow(qr, table, count + 1);
          await qr.query(`RELEASE SAVEPOINT sp_topup_row`);
          count++;
          progress = true;
          failedMap.delete(table);
        } catch (e) {
          await qr.query(`ROLLBACK TO SAVEPOINT sp_topup_row`);
          const msg = e instanceof Error ? e.message : String(e);
          failedMap.set(table, { count, error: msg });
          break;
        }
      }
    }
    if (!progress) break;
  }

  const completed: string[] = [];
  for (const t of tables) {
    const table = t.tablename;
    const countRows = await qr.query(`SELECT COUNT(*)::INT AS c FROM ${quoteIdent(table)}`);
    const count = Number(countRows?.[0]?.c || 0);
    if (count >= minRows) completed.push(table);
  }

  const failed: Array<{ table: string; count: number; error: string }> = [];
  for (const t of tables) {
    const table = t.tablename;
    if (completed.includes(table)) continue;
    const meta = failedMap.get(table);
    const countRows = await qr.query(`SELECT COUNT(*)::INT AS c FROM ${quoteIdent(table)}`);
    failed.push({
      table,
      count: Number(countRows?.[0]?.c || 0),
      error: meta?.error || 'Unknown constraint/dependency blocker',
    });
  }

  return { completed, failed };
}

async function seedQaData(dataSource: DataSource): Promise<void> {
  console.log('Seeding QA data with SQL...');
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    await qr.query(`SET session_replication_role = replica;`);
    const cleanupTables = [
      'alerts_triggered',
      'fraud_alerts',
      'fraud_detection_cycles',
      'timezone_anomalies',
      'geographic_velocity_logs',
      'vote_merkle_hashes',
      'vote_snapshots',
      'vote_behavior_profiles',
      'vote_locations',
      'trust_score_history',
      'payment_vote_reconciliation',
      'payment_vote_mismatches',
      'leaderboard_cache_control',
      'account_audit_logs',
      'admin_actions',
      'admin_audit_log',
      'alert_rules',
      'blockchain_audit_log',
      'blockchain_job_queue',
      'blockchain_stats',
      'incident_reports',
      'shard_registry',
      'sponsor_partners',
      'fraud_logs',
      'vote_batches',
      'webhook_signature_logs',
      'webhook_attempts',
      'webhook_failures',
      'webhook_events',
      'webhook_audit',
      'webhook_rate_limit',
      'webhook_secrets',
      'security_tokens',
      'otp_verifications',
      'rsa_key_versions',
      'payment_limits',
      'system_settings',
      'system_events',
      'monitoring_metrics',
      'performance_metrics',
      'rate_limit_logs',
      'db_health_checks',
      'geo_analysis_cache',
      'geo_risk_profiles',
      'verified_votes_cache',
    ];
    for (const t of cleanupTables) {
      if (await tableExists(dataSource, t)) {
        await qr.query(`TRUNCATE TABLE ${t} CASCADE;`);
      }
    }
    await qr.query(`SET session_replication_role = default;`);

    const userRows = await qr.query(`SELECT id FROM users ORDER BY id LIMIT 2`);
    if (userRows.length === 0) {
      const adminHash = await argon2.hash('admin123', {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });
      const voterHash = await argon2.hash('voter123', {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
      });
      await qr.query(
        `
        INSERT INTO users (email, username, password_hash, first_name, last_name, role, status)
        VALUES
          ('admin@votechain.com', 'admin', $1, 'Admin', 'User', 'admin'::user_role, 'active'::user_status),
          ('voter1@votechain.com', 'voter1', $2, 'Voter', 'One', 'voter'::user_role, 'active'::user_status)
        `,
        [adminHash, voterHash],
      );
    }

    const adminId = Number(
      (await qr.query(`SELECT id FROM users WHERE role='admin'::user_role ORDER BY id LIMIT 1`))[0]?.id,
    );
    const userId = Number((await qr.query(`SELECT id FROM users ORDER BY id LIMIT 1 OFFSET 1`))[0]?.id);

    let eventId = Number((await qr.query(`SELECT id FROM events ORDER BY id LIMIT 1`))[0]?.id);
    if (!eventId) {
      const ev = await qr.query(
        `
        INSERT INTO events
          (name, slug, description, status, season, creator_id, start_date, end_date, voting_start, voting_end)
        VALUES
          ('QA Event', 'qa-event', 'QA seeded event', 'active'::event_status, '2026', $1, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NOW(), NOW() + INTERVAL '7 days')
        RETURNING id
        `,
        [adminId],
      );
      eventId = Number(ev[0].id);
    }

    let categoryId = Number(
      (await qr.query(`SELECT id FROM categories WHERE event_id=$1 ORDER BY id LIMIT 1`, [eventId]))[0]
        ?.id,
    );
    if (!categoryId) {
      const c = await qr.query(
        `
        INSERT INTO categories (event_id, name, description, category_order)
        VALUES ($1, 'QA Category', 'QA seeded category', 1)
        RETURNING id
        `,
        [eventId],
      );
      categoryId = Number(c[0].id);
    }

    let contestantId = Number(
      (
        await qr.query(
          `SELECT id FROM contestants WHERE event_id=$1 AND category_id=$2 ORDER BY id LIMIT 1`,
          [eventId, categoryId],
        )
      )[0]?.id,
    );
    if (!contestantId) {
      const c = await qr.query(
        `
        INSERT INTO contestants
          (event_id, category_id, first_name, last_name, status, verification_status)
        VALUES
          ($1, $2, 'QA', 'Contestant', 'approved'::contestant_status, 'verified'::verification_status)
        RETURNING id
        `,
        [eventId, categoryId],
      );
      contestantId = Number(c[0].id);
    }

    let voteId = Number((await qr.query(`SELECT id FROM votes ORDER BY id LIMIT 1`))[0]?.id);
    if (!voteId) {
      const v = await qr.query(
        `
        INSERT INTO votes (event_id, category_id, contestant_id, voter_id, vote_type, status)
        VALUES ($1, $2, $3, $4, 'free'::vote_type, 'valid'::vote_status)
        RETURNING id
        `,
        [eventId, categoryId, contestantId, userId],
      );
      voteId = Number(v[0].id);
    }

    let paymentId = Number((await qr.query(`SELECT id FROM payments ORDER BY id LIMIT 1`))[0]?.id);
    if (!paymentId) {
      const p = await qr.query(
        `
        INSERT INTO payments
          (voter_id, event_id, category_id, contestant_id, amount, provider, status)
        VALUES
          ($1, $2, $3, $4, 10.00, 'telebirr'::payment_provider, 'completed'::payment_status)
        RETURNING id
        `,
        [userId, eventId, categoryId, contestantId],
      );
      paymentId = Number(p[0].id);
    }

    const deviceId = 1;
    const webhookProvider = await firstEnumValue(qr, 'webhook_provider', 'telebirr');
    const webhookAuditType = await firstEnumValue(qr, 'webhook_audit_type', 'verification');
    const webhookAuditStatus = await firstEnumValue(qr, 'webhook_event_status', 'success');

    await qr.query(
      `INSERT INTO fraud_logs (event_id, category_id, vote_id, device_id, user_id, fraud_type, description, action_taken, action_timestamp, is_resolved) VALUES ($1,$2,$3,$4,$5,'velocity_spike','QA fraud log','monitor',NOW(),false)`,
      [eventId, categoryId, voteId, deviceId, userId],
    );
    const fraudLogId = Number(
      (await qr.query(`SELECT id FROM fraud_logs ORDER BY created_at DESC LIMIT 1`))[0].id,
    );

    await qr.query(
      `INSERT INTO security_tokens (user_id, token, expires_at) VALUES ($1,$2,NOW()+INTERVAL '7 days')`,
      [userId, `qa-token-${Date.now()}`],
    );
    await qr.query(
      `INSERT INTO otp_verifications (user_id, otp_code, expires_at, attempts, is_used) VALUES ($1,'123456',NOW()+INTERVAL '10 minutes',0,false)`,
      [userId],
    );

    const wh = await qr.query(
      `INSERT INTO webhook_events (event_type, provider, external_event_id, payload, status) VALUES ('payment.completed',$1,$2,$3::jsonb,'processed') RETURNING id`,
      [webhookProvider, `evt_${Date.now()}`, JSON.stringify({ source: 'qa-seed' })],
    );
    const webhookEventId = Number(wh[0].id);

    await qr.query(
      `INSERT INTO webhook_signature_logs (webhook_event_id, signature_algorithm, signature_value, signature_valid, validation_method) VALUES ($1,'HMAC-SHA256','qa-signature',true,'header')`,
      [webhookEventId],
    );
    await qr.query(
      `INSERT INTO webhook_secrets (provider, secret_key_hash, version, is_active, rotated_at) VALUES ($1::webhook_provider,$2,1,true,NOW())`,
      [webhookProvider, `qa_secret_hash_${Date.now()}`.padEnd(64, '0').slice(0, 64)],
    );
    await qr.query(
      `INSERT INTO webhook_audit (provider, transaction_id, audit_type, status, details) VALUES ($1::webhook_provider,$2,$3::webhook_audit_type,$4::webhook_event_status,$5::jsonb)`,
      [webhookProvider, `txn_${Date.now()}`, webhookAuditType, webhookAuditStatus, JSON.stringify({ ok: true })],
    );
    await qr.query(
      `INSERT INTO webhook_rate_limit (provider, processed_count, period_start, period_end) VALUES ($1::webhook_provider,5,NOW()-INTERVAL '1 hour',NOW())`,
      [webhookProvider],
    );
    await qr.query(
      `INSERT INTO payment_vote_reconciliation (payment_id, vote_id, reconciled, reconciliation_notes, amount_paid, amount_received, discrepancy, reconciled_at, reconciled_by) VALUES ($1,$2,true,'QA reconciliation',10,10,0,NOW(),$3)`,
      [paymentId, voteId, adminId],
    );
    await qr.query(
      `INSERT INTO payment_vote_mismatches (payment_id, expected_votes, actual_votes, mismatch_reason) VALUES ($1,10,9,'QA mismatch sample')`,
      [paymentId],
    );
    await qr.query(
      `INSERT INTO rsa_key_versions (version, public_key, private_key, key_algorithm, is_active) VALUES (1,$1,NULL,'RSA-2048',true)`,
      ['-----BEGIN PUBLIC KEY-----QA-----END PUBLIC KEY-----'],
    );
    await qr.query(
      `INSERT INTO payment_limits (event_id, category_id, max_votes_per_user_per_day, max_votes_per_user_total, max_votes_per_device_per_day, max_votes_per_ip_per_hour) VALUES ($1,$2,100,1000,50,500)`,
      [eventId, categoryId],
    );
    await qr.query(
      `INSERT INTO system_settings (config_key, config_value, description, is_sensitive, updated_by) VALUES ('QA_MONITORING_MODE','true','QA seeded setting',false,$1)`,
      [adminId],
    );
    await qr.query(
      `INSERT INTO system_events (event_type, source, details) VALUES ('qa_seed_event','seeder','Seeded event for QA')`,
    );
    await qr.query(
      `INSERT INTO monitoring_metrics (metric_name, metric_value, source) VALUES ('qa.metric.requests',42.0000,'seeder')`,
    );
    await qr.query(
      `INSERT INTO performance_metrics (metric_name, value, device_id, process_name) VALUES ('api_latency_ms',123.45,$1,'backend')`,
      [deviceId],
    );
    await qr.query(
      `INSERT INTO rate_limit_logs (user_id, ip_address, endpoint, request_count, action_taken) VALUES ($1,'203.0.113.1','/api/v1/votes',150,'throttled')`,
      [userId],
    );
    await qr.query(
      `INSERT INTO db_health_checks (check_type, response_time, error_message) VALUES ('qa',15,NULL)`,
    );
    await qr.query(
      `INSERT INTO geo_analysis_cache (event_id, geo_hash, country, city, total_votes, cache_data) VALUES ($1,'qa-geo-hash','Ethiopia','Addis Ababa',120,$2::jsonb)`,
      [eventId, JSON.stringify({ clusters: 3 })],
    );
    await qr.query(
      `INSERT INTO geo_risk_profiles (country_code, risk_score, max_votes_per_hour, max_devices_per_ip) VALUES ('ET',15.5,10000,5)`,
    );
    await qr.query(
      `INSERT INTO verified_votes_cache (event_id, category_id, contestant_id, verified_vote_count, cache_valid) VALUES ($1,$2,$3,200,true)`,
      [eventId, categoryId, contestantId],
    );
    await qr.query(
      `INSERT INTO vote_behavior_profiles (device_id, average_vote_interval_seconds, night_vote_ratio, country_switch_count, risk_score) VALUES ($1,45,0.20,1,22.50)`,
      [deviceId],
    );
    await qr.query(
      `INSERT INTO vote_snapshots (event_id, category_id, contestant_id, free_votes, paid_votes, total_votes, snapshot_hash, anchored, total_amount, fraud_votes) VALUES ($1,$2,$3,100,50,150,$4,true,500.00,2)`,
      [eventId, categoryId, contestantId, `snapshot_${Date.now()}`],
    );
    await qr.query(
      `
      INSERT INTO vote_snapshots
        (event_id, category_id, contestant_id, free_votes, paid_votes, total_votes, snapshot_hash, anchored, total_amount, fraud_votes)
      SELECT
        c.event_id,
        c.category_id,
        c.id,
        80 + (ROW_NUMBER() OVER (ORDER BY c.id))::int,
        20 + (ROW_NUMBER() OVER (ORDER BY c.id))::int,
        100 + (ROW_NUMBER() OVER (ORDER BY c.id))::int,
        'snapshot_' || c.id::text || '_' || EXTRACT(EPOCH FROM NOW())::bigint::text,
        true,
        250.00 + (ROW_NUMBER() OVER (ORDER BY c.id))::numeric,
        0
      FROM contestants c
      WHERE c.event_id = $1
      ORDER BY c.id
      LIMIT 8
      ON CONFLICT (event_id, category_id, contestant_id) DO NOTHING
      `,
      [eventId],
    );

    const vb = await qr.query(
      `INSERT INTO vote_batches (event_id, batch_number, batch_size, total_votes) VALUES ($1,1,100,1) RETURNING id`,
      [eventId],
    );
    const voteBatchId = Number(vb[0].id);

    await qr.query(
      `INSERT INTO vote_merkle_hashes (batch_id, vote_id, vote_hash, position) VALUES ($1,$2,$3,0)`,
      [voteBatchId, voteId, `hash_${voteId}_${Date.now()}`],
    );
    await qr.query(
      `INSERT INTO vote_locations (vote_id, latitude, longitude, country, country_code, state_province, city, zip_code, accuracy_radius, is_vpn, is_proxy, is_tor, location_source) VALUES ($1,8.9806,38.7578,'Ethiopia','ET','Addis Ababa','Addis Ababa','1000',25,false,false,false,'qa_seed')`,
      [voteId],
    );
    await qr.query(
      `INSERT INTO geographic_velocity_logs (vote_id, device_id, previous_location_country, previous_location_city, current_location_country, current_location_city, "current_timestamp", distance_km, time_difference_seconds, speed_kmh, is_impossible) VALUES ($1,$2,'Ethiopia','Addis Ababa','Kenya','Nairobi',NOW(),1160.00,3600,1160.00,true)`,
      [voteId, deviceId],
    );
    await qr.query(
      `INSERT INTO timezone_anomalies (vote_id, device_id, reported_timezone, actual_timezone, offset_hours, anomaly_score, is_flagged) VALUES ($1,$2,'UTC+03:00','UTC+00:00',3,80.00,true)`,
      [voteId, deviceId],
    );
    await qr.query(
      `INSERT INTO trust_score_history (device_id, previous_score, new_score, reason) VALUES ($1,0.90,0.70,'QA risk adjustment')`,
      [deviceId],
    );
    await qr.query(
      `INSERT INTO fraud_detection_cycles (event_id, cycle_number, start_time, end_time, total_votes_checked, fraudulent_votes_found, fraud_percentage) VALUES ($1,1,NOW()-INTERVAL '10 minutes',NOW(),100,3,3.00)`,
      [eventId],
    );
    await qr.query(
      `INSERT INTO fraud_alerts (fraud_log_id, alert_type, alert_message, is_acknowledged, action_required) VALUES ($1,'velocity_violation','QA fraud alert',false,'review')`,
      [fraudLogId],
    );
    await qr.query(
      `INSERT INTO leaderboard_cache_control (event_id, category_id, last_synced_at) VALUES ($1,$2,NOW())`,
      [eventId, categoryId],
    );
    await qr.query(
      `INSERT INTO account_audit_logs (user_id, action, description, ip_address, user_agent) VALUES ($1,'login','QA account audit row','203.0.113.2','QA-Agent/1.0')`,
      [userId],
    );
    await qr.query(
      `INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details, ip_address, user_agent) VALUES ($1,'user_review','user',$2,$3::jsonb,'203.0.113.3','QA-Agent/1.0')`,
      [adminId, userId, JSON.stringify({ reason: 'qa_seed' })],
    );
    await qr.query(
      `INSERT INTO admin_audit_log (admin_id, action, entity_type, entity_id, changes, reason, ip_address) VALUES ($1,'update','event',$2,$3::jsonb,'QA audit seed','203.0.113.4')`,
      [adminId, eventId, JSON.stringify({ before: 'draft', after: 'active' })],
    );

    const ar = await qr.query(
      `INSERT INTO alert_rules (rule_name, condition, threshold, enabled, created_by) VALUES ('qa_high_risk_rule','risk_score > threshold',70.0,true,$1) RETURNING id`,
      [adminId],
    );
    await qr.query(
      `INSERT INTO alerts_triggered (alert_rule_id, trigger_value, is_acknowledged, acknowledged_by, acknowledged_at) VALUES ($1,88.5,true,$2,NOW())`,
      [Number(ar[0].id), adminId],
    );
    await qr.query(
      `INSERT INTO blockchain_audit_log (batch_id, action, details, error_message) VALUES ($1,'anchor_attempt','QA blockchain audit row',NULL)`,
      [voteBatchId],
    );
    await qr.query(
      `INSERT INTO blockchain_job_queue (job_type, job_data, priority, retry_count, max_retries) VALUES ('anchor_batch',$1::jsonb,1,0,3)`,
      [JSON.stringify({ eventId, categoryId })],
    );
    await qr.query(
      `INSERT INTO blockchain_stats (event_id, total_batches, anchored_batches, verified_batches, total_votes_on_chain, blockchain_network, average_anchor_time_seconds) VALUES ($1,1,1,1,150,'ethereum',42)`,
      [eventId],
    );
    await qr.query(
      `INSERT INTO incident_reports (event_id, title, description, detected_by) VALUES ($1,'QA Incident','Seeded incident for endpoint verification',$2)`,
      [eventId, adminId],
    );
    await qr.query(
      `INSERT INTO shard_registry (shard_name, database_host, is_active) VALUES ($1,'localhost',true)`,
      [`qa-shard-${Date.now()}`],
    );
    await qr.query(
      `INSERT INTO sponsor_partners (name, logo_url, website_url, is_active) VALUES ('QA Sponsor','https://example.com/logo.png','https://example.com',true)`,
    );

    // Seed extra rows for tables with strict unique/check constraints.
    await qr.query(`
      INSERT INTO geo_risk_profiles (country_code, risk_score, max_votes_per_hour, max_devices_per_ip)
      VALUES
        ('ET', 15.5, 10000, 5),
        ('KE', 20.0, 9000, 5),
        ('UG', 18.0, 8500, 4),
        ('US', 12.0, 12000, 6)
      ON CONFLICT (country_code) DO NOTHING
    `);

    await qr.query(
      `
      INSERT INTO otp_verifications (user_id, otp_code, expires_at, attempts, is_used)
      SELECT u.id, LPAD((100000 + ROW_NUMBER() OVER ()::int)::text, 6, '0'), NOW() + INTERVAL '10 minutes', 0, false
      FROM users u
      ORDER BY u.id
      LIMIT 6
      `,
    );

    await qr.query(
      `
      INSERT INTO vote_wallets (user_id, event_id, category_id, free_vote_used, paid_votes_purchased, paid_votes_used, daily_paid_used, last_vote_at)
      SELECT
        u.id,
        c.event_id,
        c.id,
        false,
        10,
        2,
        1,
        NOW()
      FROM users u
      CROSS JOIN categories c
      ORDER BY u.id, c.id
      LIMIT 32
      ON CONFLICT (user_id, event_id, category_id) DO NOTHING
      `,
    );

    await qr.query(
      `
      INSERT INTO vote_transactions
        (user_id, wallet_id, contestant_id, vote_type, payment_reference, amount_paid, ip_address, device_fingerprint, risk_score)
      SELECT
        vw.user_id,
        vw.id,
        ct.id,
        CASE WHEN (ROW_NUMBER() OVER ()) % 2 = 0 THEN 'PAID' ELSE 'FREE' END,
        'qa_tx_' || vw.id::text,
        1.00,
        '203.0.113.10',
        'qa-fingerprint',
        10
      FROM vote_wallets vw
      JOIN contestants ct
        ON ct.event_id = vw.event_id
       AND ct.category_id = vw.category_id
      ORDER BY vw.id, ct.id
      LIMIT 32
      `,
    );

    await qr.query(
      `
      INSERT INTO payments
        (voter_id, event_id, category_id, contestant_id, amount, provider, status, votes_purchased, provider_tx_id, transaction_reference)
      SELECT
        $1,
        $2,
        $3,
        $4,
        5.00 + gs::numeric,
        'telebirr'::payment_provider,
        'completed'::payment_status,
        1 + gs,
        'qa_txn_' || gs::text || '_' || EXTRACT(EPOCH FROM NOW())::bigint::text,
        'qa_ref_' || gs::text || '_' || EXTRACT(EPOCH FROM NOW())::bigint::text
      FROM generate_series(1, 8) AS gs
      `,
      [userId, eventId, categoryId, contestantId],
    );

    await qr.query(
      `
      INSERT INTO wallet_vote_credits
        (wallet_id, payment_id, votes_credited, votes_remaining, amount)
      SELECT
        w.id,
        p.id,
        10,
        8,
        p.amount
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM vote_wallets
      ) w
      JOIN (
        SELECT id, amount, ROW_NUMBER() OVER (ORDER BY id) AS rn
        FROM payments
      ) p
        ON p.rn = w.rn
      ORDER BY p.id
      LIMIT 64
      ON CONFLICT (payment_id) DO NOTHING
      `,
    );

    const topUp = await topUpAllBaseTables(qr, 4);
    console.log(
      `Top-up complete: ${topUp.completed.length} tables reached >=4 rows; ${topUp.failed.length} tables still below 4.`,
    );
    if (topUp.failed.length > 0) {
      for (const f of topUp.failed) {
        console.log(`- ${f.table}: ${f.count} rows (${f.error})`);
      }
    }

    await qr.commitTransaction();
    console.log('QA SQL seeding completed');
  } catch (error) {
    await qr.rollbackTransaction();
    throw error;
  } finally {
    await qr.release();
  }
}

async function runSeeder() {
  const configService = new ConfigService(process.env);
  const config = getDatabaseConfig(configService);

  const dataSource = new DataSource({
    ...config,
    entities: [path.join(__dirname, 'src/**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, 'src/migrations/*{.ts,.js}')],
  } as any);

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations completed');

    await seedQaData(dataSource);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeder();
