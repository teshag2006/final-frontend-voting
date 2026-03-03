import { MigrationInterface, QueryRunner } from 'typeorm';

export class VotesCompositeIndexes1700000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS idx_votes_event_category_contestant
  ON votes(event_id, category_id, contestant_id);
CREATE INDEX IF NOT EXISTS idx_votes_event_voter
  ON votes(event_id, voter_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP INDEX IF EXISTS idx_votes_event_voter;
DROP INDEX IF EXISTS idx_votes_event_category_contestant;
    `);
  }
}

