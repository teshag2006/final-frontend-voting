import { MigrationInterface, QueryRunner } from 'typeorm';

export class VoteReceiptsEventId1700000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE vote_receipts
  ADD COLUMN IF NOT EXISTS event_id INTEGER NULL;
    `);

    await queryRunner.query(`
UPDATE vote_receipts vr
SET event_id = v.event_id
FROM votes v
WHERE vr.vote_id = v.id
  AND vr.event_id IS NULL;
    `);

    await queryRunner.query(`
UPDATE vote_receipts vr
SET event_id = NULL
WHERE event_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM events e
    WHERE e.id = vr.event_id
  );
    `);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_vote_receipts_event_id'
  ) THEN
    ALTER TABLE vote_receipts
      ADD CONSTRAINT fk_vote_receipts_event_id
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END$$;
    `);

    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS idx_vote_receipts_event_id
  ON vote_receipts(event_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP INDEX IF EXISTS idx_vote_receipts_event_id;
    `);

    await queryRunner.query(`
ALTER TABLE vote_receipts
  DROP CONSTRAINT IF EXISTS fk_vote_receipts_event_id;
    `);

    await queryRunner.query(`
ALTER TABLE vote_receipts
  DROP COLUMN IF EXISTS event_id;
    `);
  }
}
