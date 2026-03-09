import { Guess } from "src/domain/models";
import { Result } from "../base.result";
import { DomainEvent } from "src/domain/events/base.event";

export interface SubmitGuessResultData {
  guess: Guess;
  isCorrect: boolean;
  pointsAwarded: number;
  allGuessersCorrect: boolean;
  events: DomainEvent[];
}

export type SubmitGuessResult = Result<SubmitGuessResultData>;