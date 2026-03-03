import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class InitSchema1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const sql = this.loadCanonicalSql();
    await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`);
  }

  private loadCanonicalSql(): string {
    const candidates = [
      path.join(process.cwd(), 'src', 'migrations', '0_init', 'postgres-schema.sql'),
      path.join(process.cwd(), 'backend', 'src', 'migrations', '0_init', 'postgres-schema.sql'),
      path.join(__dirname, '0_init', 'postgres-schema.sql'),
      path.join(__dirname, '..', '..', 'src', 'migrations', '0_init', 'postgres-schema.sql'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, 'utf8');
      }
    }

    throw new Error(
      'Canonical migration SQL file not found. Expected backend/src/migrations/0_init/postgres-schema.sql',
    );
  }
}
