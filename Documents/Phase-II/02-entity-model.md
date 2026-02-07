# Entity Model (Persistence Model)

## Overview
Entity model predstavlja strukturu baze (TypeORM entiteti u `Aplikacija/backend/src/infrastructure/database/entities`).

## Tabele

### users
- **PK:** `id (uuid)`
- **Kolone:** `name`, `email (unique)`, `password`, `img_path`, `total_score`, `created_at`
- **Relacije:** `users (1) -> (N) players`

### rooms
- **PK:** `id (uuid)`
- **Kolone:** `status`, `created_at`, `round_count`, `player_max_count`, `room_owner_id`, `current_round_id`
- **Relacije:**
  - `rooms (1) -> (N) players`
  - `rooms (1) -> (N) rounds`
  - `room_owner_id -> players.player_id`
  - `current_round_id -> rounds.id`

### players
- **PK:** `player_id (uuid)`
- **Kolone:** `user_id`, `room_id`, `score`, `player_state`
- **Relacije:**
  - `players (N) -> (1) users`
  - `players (N) -> (1) rooms`

### rounds
- **PK:** `id (uuid)`
- **Kolone:** `round_no`, `room_id`, `round_status`, `word`, `started_at`, `current_drawer_id`
- **Relacije:**
  - `rounds (N) -> (1) rooms`
  - `current_drawer_id -> players.player_id`
  - `rounds (1) -> (N) strokes`
  - `rounds (1) -> (N) guesses`
  - `rounds (1) -> (N) stroke_events`

### strokes
- **PK:** `id (uuid)`
- **Kolone:** `round_id`, `created_at`, `points (jsonb)`, `style (jsonb)`
- **Relacije:** `strokes (N) -> (1) rounds`

### stroke_events
- **PK:** `event_id (uuid)`
- **Kolone:** `round_id`, `seq`, `stroke_type`, `created_at`, `stroke_id`
- **Relacije:**
  - `stroke_events (N) -> (1) rounds`
  - `stroke_id -> strokes.id (nullable)`

### guesses
- **PK:** `id (uuid)`
- **Kolone:** `round_id`, `player_id`, `guess_text`, `time`, `right_guess`
- **Relacije:**
  - `guesses (N) -> (1) rounds`
  - `guesses (N) -> (1) players`

## Napomene
- `stroke_events` je authoritative event log za replay i rekonstrukciju canvasa.
- `strokes` moze sluziti kao snapshot ili analiticki zapis poteza, ali replay treba da koristi `stroke_events`.

