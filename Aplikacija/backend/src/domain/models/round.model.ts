import { RoundStatus } from './statuses';

export interface Round {
  id: string;
  roomId: string;
  roundNumber: number;
  word: string | null;
  status: RoundStatus;
  durationSeconds: number | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
