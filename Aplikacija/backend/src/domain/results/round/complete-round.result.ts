import { RoomStatus } from "src/domain/enums";
import { Round } from "src/domain/models";
import { DomainEvent } from "src/domain/events/base.event";
import { Result } from "../base.result";

export interface CompleteRoundResultData {
  round: Round;
  roomStatus: RoomStatus;
  events: DomainEvent[];
}

export type CompleteRoundResult = Result<CompleteRoundResultData>;
