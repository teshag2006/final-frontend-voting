import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventsTenantSlugUnique00161739686400000 implements MigrationInterface {
  name = 'EventsTenantSlugUnique00161739686400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_slug_key'
      AND conrelid = 'events'::regclass
  ) THEN
    ALTER TABLE events DROP CONSTRAINT events_slug_key;
  END IF;
END $$;
`);

    await queryRunner.query(`
DROP INDEX IF EXISTS "IDX_events_slug_unique";
`);

    await queryRunner.query(`
CREATE UNIQUE INDEX IF NOT EXISTS uq_events_tenant_slug
  ON events(tenant_id, slug);
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP INDEX IF EXISTS uq_events_tenant_slug;
`);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'events_slug_key'
      AND conrelid = 'events'::regclass
  ) THEN
    ALTER TABLE events ADD CONSTRAINT events_slug_key UNIQUE (slug);
  END IF;
END $$;
`);
  }
}

