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
      guessText: this.isCorrect ? '[CORRECT]' : this.guessText, // Ne otkrivaj tačan odgovor
      isCorrect: this.isCorrect,
      pointsAwarded: this.pointsAwarded
    };
  }
}