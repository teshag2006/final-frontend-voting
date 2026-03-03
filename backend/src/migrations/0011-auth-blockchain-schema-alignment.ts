import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthBlockchainSchemaAlignment1700000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMP NULL;
    `);

    await queryRunner.query(`
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS event_id INTEGER NULL;
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS blockchain_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS confirmations INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS contract_address VARCHAR(255) NULL;
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS merkle_root TEXT NULL;
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS transaction_receipt TEXT NULL;
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS error_message TEXT NULL;
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS metadata JSONB NULL;
ALTER TABLE blockchain_anchors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    await queryRunner.query(`
UPDATE blockchain_anchors ba
SET event_id = vb.event_id
FROM vote_batches vb
WHERE ba.batch_id = vb.id
  AND ba.event_id IS NULL;
    `);

    await queryRunner.query(`
UPDATE blockchain_anchors
SET confirmations = confirmation_count
WHERE confirmations = 0
  AND confirmation_count IS NOT NULL
  AND confirmation_count > 0;
    `);

    await queryRunner.query(`
UPDATE blockchain_anchors
SET merkle_root = merkle_root_on_chain
WHERE merkle_root IS NULL
  AND merkle_root_on_chain IS NOT NULL;
    `);

    await queryRunner.query(`
UPDATE blockchain_anchors
SET blockchain_status =
  CASE
    WHEN is_confirmed = TRUE THEN 'success'
    ELSE 'pending'
  END
WHERE blockchain_status IS NULL
   OR blockchain_status = '';
    `);

    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS idx_blockchain_anchors_event_id ON blockchain_anchors(event_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_anchors_status ON blockchain_anchors(blockchain_status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP INDEX IF EXISTS idx_blockchain_anchors_status;
DROP INDEX IF EXISTS idx_blockchain_anchors_event_id;
    `);

    await queryRunner.query(`
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS metadata;
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS error_message;
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS transaction_receipt;
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS merkle_root;
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS contract_address;
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS confirmations;
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS blockchain_status;
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS event_id;
ALTER TABLE blockchain_anchors DROP COLUMN IF EXISTS updated_at;
    `);

    await queryRunner.query(`
ALTER TABLE users DROP COLUMN IF EXISTS refresh_token_expires_at;
ALTER TABLE users DROP COLUMN IF EXISTS refresh_token_hash;
ALTER TABLE users DROP COLUMN IF EXISTS account_locked_until;
ALTER TABLE users DROP COLUMN IF EXISTS failed_login_attempts;
    `);
  }
}

