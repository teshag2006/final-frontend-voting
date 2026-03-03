import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersTenantContext00181739686400000 implements MigrationInterface {
  name = 'UsersTenantContext00181739686400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE users
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

  UPDATE users
  SET tenant_id = default_tenant_id
  WHERE tenant_id IS NULL;

  EXECUTE format('ALTER TABLE users ALTER COLUMN tenant_id SET DEFAULT %s', default_tenant_id);
END $$;
`);

    await queryRunner.query(`
ALTER TABLE users
  ALTER COLUMN tenant_id SET NOT NULL;
`);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_tenant_id'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT fk_users_tenant_id
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
  END IF;
END $$;
`);

    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP INDEX IF EXISTS idx_users_tenant_id;
`);

    await queryRunner.query(`
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS fk_users_tenant_id;
`);

    await queryRunner.query(`
ALTER TABLE users
  ALTER COLUMN tenant_id DROP DEFAULT;
`);

    await queryRunner.query(`
ALTER TABLE users
  DROP COLUMN IF EXISTS tenant_id;
`);
  }
}

