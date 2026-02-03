import { Guess } from "src/domain/models";
import { Result } from "../base.result";

export interface SubmitGuessResultData {
  guess: Guess;
  isCorrect: boolean;
  pointsAwarded: number;
  events: DomainEvent[];
}

export type SubmitGuessResult = Result<SubmitGuessResultData>;