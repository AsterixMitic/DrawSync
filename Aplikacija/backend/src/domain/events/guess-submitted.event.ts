import { DomainEvent } from "./base.event";

export class GuessSubmittedEvent extends DomainEvent {
  constructor(
    public readonly roundId: string,
    public readonly guessId: string,
    public readonly playerId: string,
    public readonly guessText: string,
    public readonly isCorrect: boolean,
    public readonly pointsAwarded: number
  ) {
    super('GUESS_SUBMITTED');
  }

  toPayload(): Record<string, any> {
    return {
      roundId: this.roundId,
      guessId: this.guessId,
      playerId: this.playerId,
      guessText: this.guessText,
      isCorrect: this.isCorrect,
      pointsAwarded: this.pointsAwarded
    };
  }
}