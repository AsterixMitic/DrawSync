import { Round } from "src/domain/models";

export interface IRoundRepositoryPort {
  findById(id: string): Promise<Round | null>;
  findByIdWithStrokes(id: string): Promise<Round | null>;
  findByIdWithGuesses(id: string): Promise<Round | null>;
  findActiveByRoomId(roomId: string): Promise<Round | null>;
  findByRoomId(roomId: string): Promise<Round[]>;
  getNextSeqForRound(roundId: string): Promise<number>;
  getUndoTargetStrokeId(roundId: string): Promise<string | null>;
}
