import { RoomStatus, RoundStatus } from "../enums";

export interface RoomState {
  roomId: string;
  status: RoomStatus;
  lockOwnerId: string | null;
  currentRoundId: string | null;
  activePlayerIds: string[];
  roundStatus: RoundStatus | null;
}

export interface ISharedStatePort {
  getRoomState(roomId: string): Promise<RoomState | null>;
  setRoomState(state: RoomState): Promise<void>;
  updateLockOwner(roomId: string, playerId: string | null): Promise<void>;
  addActivePlayer(roomId: string, playerId: string): Promise<void>;
  removeActivePlayer(roomId: string, playerId: string): Promise<void>;
  deleteRoomState(roomId: string): Promise<void>;

  // Stroke stack (for undo support without DB reads)
  pushStrokeId(roomId: string, strokeId: string): Promise<void>;
  popStrokeId(roomId: string): Promise<string | null>;
  clearStrokeIds(roomId: string): Promise<void>;

  // Correct guessers (for duplicate guess check without DB reads)
  addCorrectGuesser(roomId: string, playerId: string): Promise<void>;
  hasCorrectGuesser(roomId: string, playerId: string): Promise<boolean>;
  getCorrectGuesserCount(roomId: string): Promise<number>;
  clearCorrectGuessers(roomId: string): Promise<void>;
}