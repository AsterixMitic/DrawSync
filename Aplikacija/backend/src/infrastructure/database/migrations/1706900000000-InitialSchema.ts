import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1706900000000 implements MigrationInterface {
  name = 'InitialSchema1706900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "img_path" VARCHAR(500),
        "total_score" INT NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // Rooms table (without FK initially)
    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id" UUID NOT NULL,
        "status" VARCHAR(20) NOT NULL DEFAULT 'WAITING',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "round_count" INT NOT NULL DEFAULT 3,
        "player_max_count" INT NOT NULL DEFAULT 8,
        "room_owner_id" UUID,
        "current_round_id" UUID,
        CONSTRAINT "PK_rooms" PRIMARY KEY ("id")
      )
    `);

    // Players table
    await queryRunner.query(`
      CREATE TABLE "players" (
        "player_id" UUID NOT NULL,
        "user_id" UUID NOT NULL,
        "room_id" UUID NOT NULL,
        "score" INT NOT NULL DEFAULT 0,
        "player_state" VARCHAR(20) NOT NULL DEFAULT 'WAITING',
        CONSTRAINT "PK_players" PRIMARY KEY ("player_id"),
        CONSTRAINT "FK_players_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_players_room" FOREIGN KEY ("room_id") 
          REFERENCES "rooms"("id") ON DELETE CASCADE
      )
    `);

    // Add FK for room_owner after players table exists
    await queryRunner.query(`
      ALTER TABLE "rooms" 
      ADD CONSTRAINT "FK_rooms_owner" 
      FOREIGN KEY ("room_owner_id") REFERENCES "players"("player_id") 
      ON DELETE SET NULL
    `);

    // Rounds table
    await queryRunner.query(`
      CREATE TABLE "rounds" (
        "id" UUID NOT NULL,
        "round_no" INT NOT NULL,
        "room_id" UUID NOT NULL,
        "round_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "word" VARCHAR(100) NOT NULL DEFAULT '',
        "started_at" TIMESTAMP,
        "current_drawer_id" UUID,
        CONSTRAINT "PK_rounds" PRIMARY KEY ("id"),
        CONSTRAINT "FK_rounds_room" FOREIGN KEY ("room_id") 
          REFERENCES "rooms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_rounds_drawer" FOREIGN KEY ("current_drawer_id") 
          REFERENCES "players"("player_id") ON DELETE SET NULL
      )
    `);

    // Add FK for current_round after rounds table exists
    await queryRunner.query(`
      ALTER TABLE "rooms" 
      ADD CONSTRAINT "FK_rooms_current_round" 
      FOREIGN KEY ("current_round_id") REFERENCES "rounds"("id") 
      ON DELETE SET NULL
    `);

    // Strokes table
    await queryRunner.query(`
      CREATE TABLE "strokes" (
        "id" UUID NOT NULL,
        "round_id" UUID NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "points" JSONB NOT NULL,
        "style" JSONB NOT NULL,
        CONSTRAINT "PK_strokes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_strokes_round" FOREIGN KEY ("round_id") 
          REFERENCES "rounds"("id") ON DELETE CASCADE
      )
    `);

    // Stroke events table
    await queryRunner.query(`
      CREATE TABLE "stroke_events" (
        "event_id" UUID NOT NULL,
        "round_id" UUID NOT NULL,
        "seq" INT NOT NULL,
        "stroke_type" VARCHAR(20) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "stroke_id" UUID,
        CONSTRAINT "PK_stroke_events" PRIMARY KEY ("event_id"),
        CONSTRAINT "FK_stroke_events_round" FOREIGN KEY ("round_id") 
          REFERENCES "rounds"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_stroke_events_stroke" FOREIGN KEY ("stroke_id") 
          REFERENCES "strokes"("id") ON DELETE SET NULL
      )
    `);

    // Guesses table
    await queryRunner.query(`
      CREATE TABLE "guesses" (
        "id" UUID NOT NULL,
        "round_id" UUID NOT NULL,
        "player_id" UUID NOT NULL,
        "guess_text" VARCHAR(255) NOT NULL,
        "time" TIMESTAMP NOT NULL,
        "right_guess" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "PK_guesses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_guesses_round" FOREIGN KEY ("round_id") 
          REFERENCES "rounds"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_guesses_player" FOREIGN KEY ("player_id") 
          REFERENCES "players"("player_id") ON DELETE CASCADE
      )
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX "IDX_players_user" ON "players"("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_players_room" ON "players"("room_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_rounds_room" ON "rounds"("room_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_strokes_round" ON "strokes"("round_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_stroke_events_round" ON "stroke_events"("round_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_stroke_events_seq" ON "stroke_events"("round_id", "seq")`);
    await queryRunner.query(`CREATE INDEX "IDX_guesses_round" ON "guesses"("round_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_rooms_status" ON "rooms"("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_rooms_status"`);
    await queryRunner.query(`DROP INDEX "IDX_guesses_round"`);
    await queryRunner.query(`DROP INDEX "IDX_stroke_events_seq"`);
    await queryRunner.query(`DROP INDEX "IDX_stroke_events_round"`);
    await queryRunner.query(`DROP INDEX "IDX_strokes_round"`);
    await queryRunner.query(`DROP INDEX "IDX_rounds_room"`);
    await queryRunner.query(`DROP INDEX "IDX_players_room"`);
    await queryRunner.query(`DROP INDEX "IDX_players_user"`);

    // Drop FKs from rooms first
    await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT "FK_rooms_current_round"`);
    await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT "FK_rooms_owner"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "guesses"`);
    await queryRunner.query(`DROP TABLE "stroke_events"`);
    await queryRunner.query(`DROP TABLE "strokes"`);
    await queryRunner.query(`DROP TABLE "rounds"`);
    await queryRunner.query(`DROP TABLE "players"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}