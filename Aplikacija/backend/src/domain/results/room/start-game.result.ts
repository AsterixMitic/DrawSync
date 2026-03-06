import { Room } from "src/domain/models";
import { DomainEvent } from "src/domain/events/base.event";
import { Result } from "../base.result";

export interface StartGameResultData {
  room: Room;
  nextDrawerId: string | null;
  events: DomainEvent[];
}

export type StartGameResult = Result<StartGameResultData>;
