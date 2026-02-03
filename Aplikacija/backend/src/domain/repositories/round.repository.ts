import { Round } from '../models/round.model';

export interface CreateRoundPayload {
  roomId: string;
  roundNumber: number;
  word?: string | null;
  durationSeconds?: number | null;
}

export abstract class RoundRepository {
  abstract create(payload: CreateRoundPayload): Promise<Round>;
  abstract findById(id: string): Promise<Round | null>;
}
