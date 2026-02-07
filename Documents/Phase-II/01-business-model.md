# Business Model (Domain Model)

## Overview
Business model opisuje logicke entitete i pravila igre u domen sloju (`Aplikacija/backend/src/domain`). Model je nezavisan od baze i infrastrukture.

## Entiteti i vrednosni objekti

### User
- **Atributi:** `id`, `name`, `email`, `password`, `imgPath`, `totalScore`, `createdAt`
- **Odgovornosti:** profil korisnika, ukupni score kroz vise igara

### Player
- **Atributi:** `playerId`, `userId`, `roomId`, `score`, `state`, `user?`
- **Stanja:** `WAITING`, `DRAWING`, `GUESSING`, `SPECTATING`
- **Odgovornosti:** ucesce korisnika u konkretnom room-u (score po partiji, stanje u rundi)

### Room
- **Atributi:** `id`, `status`, `createdAt`, `roundCount`, `playerMaxCount`, `roomOwnerId`, `currentRoundId`
- **Relacije:** `players[]`, `rounds[]`
- **Status:** `WAITING`, `IN_PROGRESS`, `FINISHED`
- **Pravila:**
  - room je pun kada `players.length >= playerMaxCount`
  - samo `WAITING` room prima nove igrace
  - prvi igrac postaje owner (`roomOwnerId`)
  - po zavrsetku svih rundi status prelazi u `FINISHED`

### Round
- **Atributi:** `id`, `roundNo`, `roomId`, `status`, `word`, `startedAt`, `currentDrawerId`
- **Relacije:** `strokes[]`, `guesses[]`
- **Status:** `PENDING`, `ACTIVE`, `COMPLETED`
- **Pravila:**
  - `word` mora biti postavljen pre starta
  - runda moze da krene samo iz `PENDING`
  - `currentDrawerId` mora biti postavljen pre starta

### Stroke
- **Atributi:** `id`, `roundId`, `createdAt`, `points[]`, `style`
- **Odgovornost:** jedan potez crtanja

### StrokeEvent
- **Atributi:** `eventId`, `roundId`, `seq`, `strokeType`, `createdAt`, `strokeId?`
- **Tipovi:** `DRAW`, `ERASE`, `CLEAR`, `UNDO`
- **Odgovornost:** event log za event sourcing (authoritative zapis)

### Guess
- **Atributi:** `id`, `roundId`, `playerId`, `guessText`, `time`, `isCorrect`
- **Odgovornost:** pokusaj pogodka pojma

### Value Objects
- **StrokePoint:** `x`, `y`, `pressure`, `timestamp`
- **StrokeStyle:** `color`, `lineWidth`, `lineCap`, `opacity`

## Kljucevi odnosa
- `User (1) -> (N) Player`
- `Room (1) -> (N) Player`
- `Room (1) -> (N) Round`
- `Round (1) -> (N) Stroke`
- `Round (1) -> (N) Guess`
- `Round (1) -> (N) StrokeEvent`
- `Player (1) -> (N) Guess`

## Domen pravila (skraceno)
- Samo `DRAWING` igrac moze crtati.
- Crtanje i pogadjanje dozvoljeno samo tokom `ACTIVE` runde.
- Drawer ne moze da pogadja.
- `UNDO` i `CLEAR` se tretiraju kao eventi u logu, ne kao direktna izmena stroke liste.

