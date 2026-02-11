import { DomainEvent } from "./base.event";

export class RoundCompletedEvent extends DomainEvent {
  constructor(
    public readonly roomId: string,
    public readonly roundId: string,
    public readonly roundNo: number,
    public readonly isGameFinished: boolean
  ) {
    super('ROUND_COMPLETED');
  }

  toPayload(): Record<string, any> {
    return {
      roomId: this.roomId,
      roundId: this.roundId,
      roundNo: this.roundNo,
      isGameFinished: this.isGameFinished
    };
  }
}
