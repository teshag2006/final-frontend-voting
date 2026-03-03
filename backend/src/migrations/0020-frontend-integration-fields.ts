import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Frontend Integration Fields
 *
 * Adds the columns required to make backend responses match
 * the frontend mock data shapes exactly:
 *
 *  contestants:
 *    - slug          VARCHAR(255) NULLABLE  (URL-safe identifier, auto-generated on create)
 *    - tagline       VARCHAR(255) NULLABLE  (short promo text)
 *    - country       VARCHAR(100) NULLABLE  (contestant's country)
 *
 *  events:
 *    - tagline                  VARCHAR(255) NULLABLE
 *    - organizer_name           VARCHAR(255) NULLABLE
 *    - vote_price               DECIMAL(10,2) NULLABLE  (base price per vote)
 *    - max_votes_per_transaction INTEGER NULLABLE
 *    - vote_packages            JSONB NULLABLE           (tiered pricing array)
 *
 *  users:
 *    - google_id         VARCHAR(255) NULLABLE  (for googleLinked voter profile field)
 *    - profile_image_url VARCHAR(500) NULLABLE  (user avatar)
 */
export class FrontendIntegrationFields1700000000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── contestants ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE contestants
        ADD COLUMN IF NOT EXISTS slug          VARCHAR(255),
        ADD COLUMN IF NOT EXISTS tagline       VARCHAR(255),
        ADD COLUMN IF NOT EXISTS country       VARCHAR(100);
    `);

    // Non-unique index on slug for fast slug-based lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_contestants_slug
        ON contestants (slug)
        WHERE slug IS NOT NULL;
    `);

    // ── events ───────────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE events
        ADD COLUMN IF NOT EXISTS tagline                  VARCHAR(255),
        ADD COLUMN IF NOT EXISTS organizer_name           VARCHAR(255),
        ADD COLUMN IF NOT EXISTS vote_price               DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS max_votes_per_transaction INTEGER,
        ADD COLUMN IF NOT EXISTS vote_packages            JSONB;
    `);

    // ── users ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS google_id         VARCHAR(255),
        ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
    `);

    // Unique index on google_id (one account per Google identity)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
        ON users (google_id)
        WHERE google_id IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // users
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_google_id;`);
    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS google_id,
        DROP COLUMN IF EXISTS profile_image_url;
    `);

    // events
    await queryRunner.query(`
      ALTER TABLE events
        DROP COLUMN IF EXISTS tagline,
        DROP COLUMN IF EXISTS organizer_name,
        DROP COLUMN IF EXISTS vote_price,
        DROP COLUMN IF EXISTS max_votes_per_transaction,
        DROP COLUMN IF EXISTS vote_packages;
    `);

    // contestants
    await queryRunner.query(`DROP INDEX IF EXISTS idx_contestants_slug;`);
    await queryRunner.query(`
      ALTER TABLE contestants
        DROP COLUMN IF EXISTS slug,
        DROP COLUMN IF EXISTS tagline,
        DROP COLUMN IF EXISTS country;
    `);
  }
}
