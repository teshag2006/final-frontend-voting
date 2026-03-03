import { MigrationInterface, QueryRunner } from 'typeorm';

export class SponsorPublicTracking1700000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sponsor_impressions (
        id SERIAL PRIMARY KEY,
        sponsor_id INTEGER NULL REFERENCES sponsors(id) ON DELETE SET NULL,
        placement_id VARCHAR(255) NULL,
        source_page VARCHAR(255) NULL,
        event_slug VARCHAR(255) NULL,
        contestant_slug VARCHAR(255) NULL,
        ip_address VARCHAR(64) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sponsor_impressions_sponsor_id
      ON sponsor_impressions(sponsor_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sponsor_impressions_created_at
      ON sponsor_impressions(created_at);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sponsor_clicks (
        id SERIAL PRIMARY KEY,
        sponsor_id INTEGER NULL REFERENCES sponsors(id) ON DELETE SET NULL,
        placement_id VARCHAR(255) NULL,
        source_page VARCHAR(255) NULL,
        event_slug VARCHAR(255) NULL,
        contestant_slug VARCHAR(255) NULL,
        target_url VARCHAR(1024) NULL,
        ip_address VARCHAR(64) NULL,
        user_agent TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_sponsor_id
      ON sponsor_clicks(sponsor_id);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sponsor_clicks_created_at
      ON sponsor_clicks(created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sponsor_clicks_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sponsor_clicks_sponsor_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sponsor_clicks;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_sponsor_impressions_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sponsor_impressions_sponsor_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sponsor_impressions;`);
  }
}

