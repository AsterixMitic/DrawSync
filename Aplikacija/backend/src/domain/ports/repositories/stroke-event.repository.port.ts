import { StrokeEvent } from "src/domain/models";

export interface IStrokeEventRepositoryPort {
  findByRoundId(roundId: string): Promise<StrokeEvent[]>;
}
