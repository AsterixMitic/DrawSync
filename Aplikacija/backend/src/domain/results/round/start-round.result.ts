import { PlayerState } from "src/domain/enums";
import { Round } from "src/domain/models";
import { Result } from "../base.result";
import { DomainEvent } from "src/domain/events/base.event";

export interface StartRoundResultData {
  round: Round;
  drawerId: string;
  playerStates: { playerId: string; state: PlayerState }[];
  events: DomainEvent[];
}

export type StartRoundResult = Result<StartRoundResultData>;