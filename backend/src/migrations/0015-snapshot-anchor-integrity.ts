import { MigrationInterface, QueryRunner } from 'typeorm';

export class SnapshotAnchorIntegrity00151739686400000 implements MigrationInterface {
  name = 'SnapshotAnchorIntegrity00151739686400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DELETE FROM vote_snapshots vs
USING (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY event_id, category_id, contestant_id
        ORDER BY snapshot_timestamp DESC, created_at DESC, id DESC
      ) AS rn
    FROM vote_snapshots
  ) ranked
  WHERE ranked.rn > 1
) duplicates
WHERE vs.id = duplicates.id;
`);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_vote_snapshots_event_category_contestant'
  ) THEN
    ALTER TABLE vote_snapshots
      ADD CONSTRAINT uq_vote_snapshots_event_category_contestant
      UNIQUE (event_id, category_id, contestant_id);
  END IF;
END $$;
`);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_vote_snapshots_event_id'
  ) THEN
    ALTER TABLE vote_snapshots
      ADD CONSTRAINT fk_vote_snapshots_event_id
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE NOT VALID;
  END IF;
END $$;
`);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_vote_snapshots_category_id'
  ) THEN
    ALTER TABLE vote_snapshots
      ADD CONSTRAINT fk_vote_snapshots_category_id
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE NOT VALID;
  END IF;
END $$;
`);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_vote_snapshots_contestant_id'
  ) THEN
    ALTER TABLE vote_snapshots
      ADD CONSTRAINT fk_vote_snapshots_contestant_id
      FOREIGN KEY (contestant_id) REFERENCES contestants(id) ON DELETE CASCADE NOT VALID;
  END IF;
END $$;
`);

    await queryRunner.query(`
UPDATE blockchain_anchors ba
SET event_id = vb.event_id
FROM vote_batches vb
WHERE ba.batch_id = vb.id
  AND ba.event_id IS NULL;
`);

    await queryRunner.query(`
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_blockchain_anchors_event_id'
  ) THEN
    ALTER TABLE blockchain_anchors
      ADD CONSTRAINT fk_blockchain_anchors_event_id
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE NOT VALID;
  END IF;
END $$;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE blockchain_anchors
  DROP CONSTRAINT IF EXISTS fk_blockchain_anchors_event_id;
`);

    await queryRunner.query(`
ALTER TABLE vote_snapshots
  DROP CONSTRAINT IF EXISTS fk_vote_snapshots_contestant_id;
`);

    await queryRunner.query(`
ALTER TABLE vote_snapshots
  DROP CONSTRAINT IF EXISTS fk_vote_snapshots_category_id;
`);

    await queryRunner.query(`
ALTER TABLE vote_snapshots
  DROP CONSTRAINT IF EXISTS fk_vote_snapshots_event_id;
`);

    await queryRunner.query(`
ALTER TABLE vote_snapshots
  DROP CONSTRAINT IF EXISTS uq_vote_snapshots_event_category_contestant;
`);
  }
}

