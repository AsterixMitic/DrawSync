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
}