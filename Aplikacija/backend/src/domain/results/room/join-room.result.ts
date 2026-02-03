import { Player, Room } from "src/domain/models";
import { Result } from "../base.result";

export interface JoinRoomResultData {
  room: Room;
  player: Player;
  events: DomainEvent[];
}

export type JoinRoomResult = Result<JoinRoomResultData>;