import { Player, Room } from "src/domain/models";
import { Result } from "../base.result";
import { DomainEvent } from "src/domain/events/base.event";

export interface JoinRoomResultData {
  room: Room;
  player: Player;
  events: DomainEvent[];
}

export type JoinRoomResult = Result<JoinRoomResultData>;