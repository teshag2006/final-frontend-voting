import { MigrationInterface, QueryRunner } from 'typeorm';

export class SponsorsLifecycleDates1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sponsors
      ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE sponsors
      ADD COLUMN IF NOT EXISTS started_date TIMESTAMP NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE sponsors
      ADD COLUMN IF NOT EXISTS terminated_date TIMESTAMP NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sponsors
      DROP COLUMN IF EXISTS terminated_date;
    `);
    await queryRunner.query(`
      ALTER TABLE sponsors
      DROP COLUMN IF EXISTS started_date;
    `);
    await queryRunner.query(`
      ALTER TABLE sponsors
      DROP COLUMN IF EXISTS scheduled_date;
    `);
  }
}
