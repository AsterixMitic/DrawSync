import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlayerUniqueConstraint1706900000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "players"
      ADD CONSTRAINT "UQ_players_user_room" UNIQUE ("user_id", "room_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "players" DROP CONSTRAINT "UQ_players_user_room"
    `);
  }
}
