import { MigrationInterface, QueryRunner } from 'typeorm';

export class ValidateIntegrityConstraints00171739686400000 implements MigrationInterface {
  name = 'ValidateIntegrityConstraints00171739686400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove orphan or cross-linked snapshot rows before FK validation.
    await queryRunner.query(`
DELETE FROM vote_snapshots vs
WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.id = vs.event_id)
   OR NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = vs.category_id)
   OR NOT EXISTS (SELECT 1 FROM contestants ct WHERE ct.id = vs.contestant_id)
   OR EXISTS (
      SELECT 1
      FROM categories c
      WHERE c.id = vs.category_id
        AND c.event_id <> vs.event_id
   )
   OR EXISTS (
      SELECT 1
      FROM contestants ct
      WHERE ct.id = vs.contestant_id
        AND (ct.event_id <> vs.event_id OR ct.category_id <> vs.category_id)
   );
`);

    // Normalize invalid anchor event references to NULL (column is nullable by design).
    await queryRunner.query(`
UPDATE blockchain_anchors ba
SET event_id = NULL
WHERE ba.event_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM events e
    WHERE e.id = ba.event_id
  );
`);

    await queryRunner.query(`
ALTER TABLE vote_snapshots
  VALIDATE CONSTRAINT fk_vote_snapshots_event_id;
`);

    await queryRunner.query(`
ALTER TABLE vote_snapshots
  VALIDATE CONSTRAINT fk_vote_snapshots_category_id;
`);

    await queryRunner.query(`
ALTER TABLE vote_snapshots
  VALIDATE CONSTRAINT fk_vote_snapshots_contestant_id;
`);

    await queryRunner.query(`
ALTER TABLE blockchain_anchors
  VALIDATE CONSTRAINT fk_blockchain_anchors_event_id;
`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Validation state cannot be reliably reverted without dropping constraints.
  }
}

