import { MigrationInterface, QueryRunner } from 'typeorm';

export class SantimPayProvider1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'santimpay';`,
    );
    await queryRunner.query(
      `ALTER TYPE webhook_provider ADD VALUE IF NOT EXISTS 'santimpay';`,
    );
  }

  public async down(): Promise<void> {
    // PostgreSQL does not support removing enum values in-place safely.
  }
}
