import { Player, Room } from "src/domain/models";
import { Result } from "../base.result";

export interface LeaveRoomResultData {
  room: Room | null;  // null ako je soba obrisana
  removedPlayer: Player;
  newOwnerId: string | null;
  roomDeleted: boolean;
  events: DomainEvent[];
}

export type LeaveRoomResult = Result<LeaveRoomResultData>;