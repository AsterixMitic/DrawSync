import { Stroke } from "src/domain/models";

export interface IStrokeRepositoryPort {
  findById(id: string): Promise<Stroke | null>;
  findByRoundId(roundId: string): Promise<Stroke[]>;
}
