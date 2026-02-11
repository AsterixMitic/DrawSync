import { Player } from "src/domain/models";

export interface IPlayerRepositoryPort {
  findById(id: string): Promise<Player | null>;
  findByIdWithUser(id: string): Promise<Player | null>;
  findByRoomId(roomId: string): Promise<Player[]>;
  findByRoomAndUser(roomId: string, userId: string): Promise<Player | null>;
  hasPlayerGuessedCorrectly(roundId: string, playerId: string): Promise<boolean>;
}