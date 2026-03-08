import { Result } from '../base.result';

export interface ResetRoomResultData {
  roomId: string;
}

export type ResetRoomResult = Result<ResetRoomResultData>;
