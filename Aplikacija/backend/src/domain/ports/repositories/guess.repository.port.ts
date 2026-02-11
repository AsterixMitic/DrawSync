import { Guess } from "src/domain/models";

export interface IGuessRepositoryPort {
  findById(id: string): Promise<Guess | null>;
  findByRoundId(roundId: string): Promise<Guess[]>;
  findByPlayerId(playerId: string): Promise<Guess[]>;
}
