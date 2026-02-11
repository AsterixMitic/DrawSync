import { DomainEvent } from "./base.event";

export class CorrectGuessEvent extends DomainEvent {
  constructor(
    public readonly roundId: string,
    public readonly playerId: string,
    public readonly pointsAwarded: number
  ) {
    super('CORRECT_GUESS');
  }

  toPayload(): Record<string, any> {
    return {
      roundId: this.roundId,
      playerId: this.playerId,
      pointsAwarded: this.pointsAwarded
    };
  }
}
