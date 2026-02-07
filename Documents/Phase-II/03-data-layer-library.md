# Data Layer Pattern and Persistence Library

## Pattern
Sloj perzistencije koristi **Data Mapper** + **Repository** pattern:
- **Mappers** mapiraju Domain modele u Entity modele i obrnuto.
- **Repositories** enkapsuliraju citanje podataka i vracaju Domain modele.
- **Operations** sadrze iskljucivo upis (bez biznis logike).

## Event Sourcing za crtanje
- `stroke_events` je authoritative izvor istine za replay.
- `DRAW`, `UNDO`, `CLEAR` eventi se obraduju sekvencijalno po `seq`.
- `strokes` tabela nije authoritative; koristi se za snapshot ili analitiku.

## Persistence Library
Implementirana je biblioteka `BusinessModelPersistence`:
- Lokacija: `Aplikacija/backend/src/infrastructure/data-layer/business-model.persistence.ts`
- Odgovornost: snimanje i ucitavanje Domain modela uz mapiranje u Entity model.

### Glavne funkcije
- `loadRoom(roomId, options)`
- `loadRound(roundId, options)`
- `loadRoundEventLog(roundId)`
- `saveRoom(room)`
- `savePlayer(player)`
- `saveRound(round)`
- `saveStroke(stroke)`
- `saveStrokeEvent(event)`
- `saveGuess(guess)`
- `removePlayer(playerId)`
- `deleteRoom(roomId)`

### Mapiranje
Mapiranje se radi preko postojecih Data Mapper klasa:
- `RoomMapper`, `PlayerMapper`, `RoundMapper`, `StrokeMapper`, `StrokeEventMapper`, `GuessMapper`
