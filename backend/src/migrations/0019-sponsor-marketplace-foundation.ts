import { MigrationInterface, QueryRunner } from 'typeorm';

export class SponsorMarketplaceFoundation1700000000019
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE sponsor_verification_status AS ENUM ('pending', 'verified', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE sponsor_account_status AS ENUM ('active', 'suspended', 'under_review');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE sponsor_document_type AS ENUM ('business_license', 'tax_certificate', 'other');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE sponsor_document_verification_status AS ENUM ('pending', 'verified', 'rejected');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE contestant_integrity_status AS ENUM ('normal', 'suspicious', 'under_review');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE contestant_tier_level AS ENUM ('A', 'B', 'C');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE campaign_type AS ENUM ('banner', 'video', 'social_link');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE campaign_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE campaign_payment_status AS ENUM ('pending', 'confirmed_manual', 'failed', 'refunded');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE sponsor_trust_status AS ENUM ('verified', 'new', 'flagged');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE enforcement_entity_type AS ENUM ('contestant', 'sponsor');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE sponsors
      ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50) NULL,
      ADD COLUMN IF NOT EXISTS company_description TEXT NULL,
      ADD COLUMN IF NOT EXISTS industry_category VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS company_size VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS postal_code VARCHAR(30) NULL,
      ADD COLUMN IF NOT EXISTS tax_id_number VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS profile_completion_score NUMERIC(5,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS verification_status sponsor_verification_status NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS trust_score NUMERIC(5,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS account_status sponsor_account_status NOT NULL DEFAULT 'active';
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sponsor_documents (
        id SERIAL PRIMARY KEY,
        sponsor_id INTEGER NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
        document_type sponsor_document_type NOT NULL DEFAULT 'other',
        file_url VARCHAR(512) NOT NULL,
        mime_type VARCHAR(100) NULL,
        verification_status sponsor_document_verification_status NOT NULL DEFAULT 'pending',
        uploaded_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sponsor_documents_sponsor_id ON sponsor_documents(sponsor_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sponsor_documents_verification_status ON sponsor_documents(verification_status);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contestant_integrity (
        id SERIAL PRIMARY KEY,
        contestant_id INTEGER NOT NULL UNIQUE REFERENCES contestants(id) ON DELETE CASCADE,
        follower_spike_flag BOOLEAN NOT NULL DEFAULT FALSE,
        vote_spike_flag BOOLEAN NOT NULL DEFAULT FALSE,
        engagement_ratio NUMERIC(8,4) NOT NULL DEFAULT 0,
        suspicious_activity_score NUMERIC(6,2) NOT NULL DEFAULT 0,
        integrity_score NUMERIC(5,2) NOT NULL DEFAULT 100,
        status contestant_integrity_status NOT NULL DEFAULT 'normal',
        total_followers INTEGER NOT NULL DEFAULT 0,
        follower_growth_24h NUMERIC(10,2) NOT NULL DEFAULT 0,
        follower_growth_7d NUMERIC(10,2) NOT NULL DEFAULT 0,
        engagement_rate NUMERIC(8,4) NOT NULL DEFAULT 0,
        engagement_spike_factor NUMERIC(8,4) NOT NULL DEFAULT 0,
        vote_velocity_24h NUMERIC(10,2) NOT NULL DEFAULT 0,
        vote_velocity_7d NUMERIC(10,2) NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_contestant_integrity_status ON contestant_integrity(status);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS contestant_tiers (
        id SERIAL PRIMARY KEY,
        contestant_id INTEGER NOT NULL UNIQUE REFERENCES contestants(id) ON DELETE CASCADE,
        tier_level contestant_tier_level NOT NULL DEFAULT 'C',
        assigned_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_contestant_tiers_tier_level ON contestant_tiers(tier_level);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        sponsor_id INTEGER NOT NULL REFERENCES sponsors(id) ON DELETE RESTRICT,
        contestant_id INTEGER NOT NULL REFERENCES contestants(id) ON DELETE RESTRICT,
        campaign_type campaign_type NOT NULL,
        deliverables TEXT NULL,
        agreed_price NUMERIC(12,2) NOT NULL DEFAULT 0,
        commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        start_date TIMESTAMP NULL,
        end_date TIMESTAMP NULL,
        campaign_status campaign_status NOT NULL DEFAULT 'pending',
        payment_status campaign_payment_status NOT NULL DEFAULT 'pending',
        activation_snapshot_taken BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_sponsor_id ON campaigns(sponsor_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_contestant_id ON campaigns(contestant_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_status ON campaigns(campaign_status);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON campaigns(payment_status);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS campaign_snapshots (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
        contestant_id INTEGER NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
        votes_before INTEGER NOT NULL DEFAULT 0,
        followers_before INTEGER NOT NULL DEFAULT 0,
        engagement_before NUMERIC(8,4) NOT NULL DEFAULT 0,
        rank_before INTEGER NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_campaign_snapshots_contestant_id ON campaign_snapshots(contestant_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS campaign_reports (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
        votes_after INTEGER NOT NULL DEFAULT 0,
        followers_after INTEGER NOT NULL DEFAULT 0,
        engagement_after NUMERIC(8,4) NOT NULL DEFAULT 0,
        growth_summary JSONB NULL,
        generated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sponsor_trust_profiles (
        id SERIAL PRIMARY KEY,
        sponsor_id INTEGER NOT NULL UNIQUE REFERENCES sponsors(id) ON DELETE CASCADE,
        total_campaigns INTEGER NOT NULL DEFAULT 0,
        completed_campaigns INTEGER NOT NULL DEFAULT 0,
        cancelled_campaigns INTEGER NOT NULL DEFAULT 0,
        late_payment_count INTEGER NOT NULL DEFAULT 0,
        trust_score NUMERIC(5,2) NOT NULL DEFAULT 0,
        status sponsor_trust_status NOT NULL DEFAULT 'new',
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sponsor_trust_profiles_status ON sponsor_trust_profiles(status);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS enforcement_logs (
        id SERIAL PRIMARY KEY,
        entity_type enforcement_entity_type NOT NULL,
        entity_id INTEGER NOT NULL,
        violation_type VARCHAR(100) NOT NULL,
        description TEXT NULL,
        penalty_score NUMERIC(6,2) NOT NULL DEFAULT 0,
        action_taken VARCHAR(255) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_enforcement_logs_entity ON enforcement_logs(entity_type, entity_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_enforcement_logs_created_at ON enforcement_logs(created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS enforcement_logs;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sponsor_trust_profiles;`);
    await queryRunner.query(`DROP TABLE IF EXISTS campaign_reports;`);
    await queryRunner.query(`DROP TABLE IF EXISTS campaign_snapshots;`);
    await queryRunner.query(`DROP TABLE IF EXISTS campaigns;`);
    await queryRunner.query(`DROP TABLE IF EXISTS contestant_tiers;`);
    await queryRunner.query(`DROP TABLE IF EXISTS contestant_integrity;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sponsor_documents;`);

    await queryRunner.query(`
      ALTER TABLE sponsors
      DROP COLUMN IF EXISTS account_status,
      DROP COLUMN IF EXISTS trust_score,
      DROP COLUMN IF EXISTS verification_status,
      DROP COLUMN IF EXISTS profile_completion_score,
      DROP COLUMN IF EXISTS registration_number,
      DROP COLUMN IF EXISTS tax_id_number,
      DROP COLUMN IF EXISTS postal_code,
      DROP COLUMN IF EXISTS address_line_2,
      DROP COLUMN IF EXISTS address_line_1,
      DROP COLUMN IF EXISTS city,
      DROP COLUMN IF EXISTS country,
      DROP COLUMN IF EXISTS company_size,
      DROP COLUMN IF EXISTS industry_category,
      DROP COLUMN IF EXISTS company_description,
      DROP COLUMN IF EXISTS phone_number,
      DROP COLUMN IF EXISTS contact_person_name;
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS enforcement_entity_type;`);
    await queryRunner.query(`DROP TYPE IF EXISTS sponsor_trust_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS campaign_payment_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS campaign_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS campaign_type;`);
    await queryRunner.query(`DROP TYPE IF EXISTS contestant_tier_level;`);
    await queryRunner.query(`DROP TYPE IF EXISTS contestant_integrity_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS sponsor_document_verification_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS sponsor_document_type;`);
    await queryRunner.query(`DROP TYPE IF EXISTS sponsor_account_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS sponsor_verification_status;`);
  }
}
