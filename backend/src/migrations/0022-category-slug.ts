import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategorySlug1700000000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
    `);

    await queryRunner.query(`
      WITH normalized AS (
        SELECT
          id,
          event_id,
          CASE
            WHEN COALESCE(name, '') = '' THEN 'category'
            ELSE TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '-', 'g'))
          END AS base_slug
        FROM categories
      ),
      ranked AS (
        SELECT
          id,
          event_id,
          CASE
            WHEN COALESCE(base_slug, '') = '' THEN 'category'
            ELSE base_slug
          END AS resolved_slug,
          ROW_NUMBER() OVER (
            PARTITION BY event_id, CASE WHEN COALESCE(base_slug, '') = '' THEN 'category' ELSE base_slug END
            ORDER BY id
          ) AS rn
        FROM normalized
      )
      UPDATE categories c
      SET slug = CASE
        WHEN r.rn = 1 THEN r.resolved_slug
        ELSE r.resolved_slug || '-' || r.rn
      END
      FROM ranked r
      WHERE c.id = r.id
      AND (c.slug IS NULL OR c.slug = '');
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_event_slug_unique
      ON categories(event_id, slug)
      WHERE slug IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_categories_event_slug_unique;
    `);

    await queryRunner.query(`
      ALTER TABLE categories
      DROP COLUMN IF EXISTS slug;
    `);
  }
}

