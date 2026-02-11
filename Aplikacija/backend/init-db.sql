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
);

CREATE TABLE "rooms" (
  "id" UUID NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'WAITING',
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "round_count" INT NOT NULL DEFAULT 3,
  "player_max_count" INT NOT NULL DEFAULT 8,
  "room_owner_id" UUID,
  "current_round_id" UUID,
  CONSTRAINT "PK_rooms" PRIMARY KEY ("id")
);

CREATE TABLE "players" (
  "player_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "room_id" UUID NOT NULL,
  "score" INT NOT NULL DEFAULT 0,
  "player_state" VARCHAR(20) NOT NULL DEFAULT 'WAITING',
  CONSTRAINT "PK_players" PRIMARY KEY ("player_id"),
  CONSTRAINT "FK_players_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_players_room" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE
);

ALTER TABLE "rooms" ADD CONSTRAINT "FK_rooms_owner" FOREIGN KEY ("room_owner_id") REFERENCES "players"("player_id") ON DELETE SET NULL;

CREATE TABLE "rounds" (
  "id" UUID NOT NULL,
  "round_no" INT NOT NULL,
  "room_id" UUID NOT NULL,
  "round_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  "word" VARCHAR(100) NOT NULL DEFAULT '',
  "started_at" TIMESTAMP,
  "current_drawer_id" UUID,
  CONSTRAINT "PK_rounds" PRIMARY KEY ("id"),
  CONSTRAINT "FK_rounds_room" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_rounds_drawer" FOREIGN KEY ("current_drawer_id") REFERENCES "players"("player_id") ON DELETE SET NULL
);

ALTER TABLE "rooms" ADD CONSTRAINT "FK_rooms_current_round" FOREIGN KEY ("current_round_id") REFERENCES "rounds"("id") ON DELETE SET NULL;

CREATE TABLE "strokes" (
  "id" UUID NOT NULL,
  "round_id" UUID NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "points" JSONB NOT NULL,
  "style" JSONB NOT NULL,
  CONSTRAINT "PK_strokes" PRIMARY KEY ("id"),
  CONSTRAINT "FK_strokes_round" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE
);

CREATE TABLE "stroke_events" (
  "event_id" UUID NOT NULL,
  "round_id" UUID NOT NULL,
  "seq" INT NOT NULL,
  "stroke_type" VARCHAR(20) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "stroke_id" UUID,
  CONSTRAINT "PK_stroke_events" PRIMARY KEY ("event_id"),
  CONSTRAINT "FK_stroke_events_round" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_stroke_events_stroke" FOREIGN KEY ("stroke_id") REFERENCES "strokes"("id") ON DELETE SET NULL
);

CREATE TABLE "guesses" (
  "id" UUID NOT NULL,
  "round_id" UUID NOT NULL,
  "player_id" UUID NOT NULL,
  "guess_text" VARCHAR(255) NOT NULL,
  "time" TIMESTAMP NOT NULL,
  "right_guess" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "PK_guesses" PRIMARY KEY ("id"),
  CONSTRAINT "FK_guesses_round" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_guesses_player" FOREIGN KEY ("player_id") REFERENCES "players"("player_id") ON DELETE CASCADE
);

CREATE INDEX "IDX_players_user" ON "players"("user_id");
CREATE INDEX "IDX_players_room" ON "players"("room_id");
CREATE INDEX "IDX_rounds_room" ON "rounds"("room_id");
CREATE INDEX "IDX_strokes_round" ON "strokes"("round_id");
CREATE INDEX "IDX_stroke_events_round" ON "stroke_events"("round_id");
CREATE INDEX "IDX_stroke_events_seq" ON "stroke_events"("round_id", "seq");
CREATE INDEX "IDX_guesses_round" ON "guesses"("round_id");
CREATE INDEX "IDX_rooms_status" ON "rooms"("status");
