import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantsFoundation00141739686400000 implements MigrationInterface {
  name = 'TenantsFoundation00141739686400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  plan VARCHAR(64) NOT NULL DEFAULT 'starter',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`);

    await queryRunner.query(`
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS tenant_id INTEGER NULL;
`);

    await queryRunner.query(`
DO $$
DECLARE
  default_tenant_id INTEGER;
BEGIN
  INSERT INTO tenants (name, slug, status, plan)
  VALUES ('Default Tenant', 'default-tenant', 'active', 'starter')
  ON CONFLICT (slug)
  DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW()
  RETURNING id INTO default_tenant_id;

  UPDATE events
  SET tenant_id = default_tenant_id
  WHERE tenant_id IS NULL;

  EXECUTE format('ALTER TABLE events ALTER COLUMN tenant_id SET DEFAULT %s', default_tenant_id);
END $$;
`);

    await queryRunner.query(`
ALTER TABLE events
  ALTER COLUMN tenant_id SET NOT NULL;
`);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_events_tenant_id'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT fk_events_tenant_id
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
  END IF;
END $$;
`);

    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP INDEX IF EXISTS idx_events_tenant_id;
`);

    await queryRunner.query(`
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS fk_events_tenant_id;
`);

    await queryRunner.query(`
ALTER TABLE events
  ALTER COLUMN tenant_id DROP DEFAULT;
`);

    await queryRunner.query(`
ALTER TABLE events
  DROP COLUMN IF EXISTS tenant_id;
`);

    await queryRunner.query(`
DROP TABLE IF EXISTS tenants;
`);
  }
}
