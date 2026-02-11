import { DomainEvent } from "./base.event";

export class RoundStartedEvent extends DomainEvent {
  constructor(
    public readonly roomId: string,
    public readonly roundId: string,
    public readonly roundNo: number,
    public readonly drawerId: string,
    public readonly word: string
  ) {
    super('ROUND_STARTED');
  }

  toPayload(): Record<string, any> {
    return {
      roomId: this.roomId,
      roundId: this.roundId,
      roundNo: this.roundNo,
      drawerId: this.drawerId,
      word: this.word
    };
  }
}
