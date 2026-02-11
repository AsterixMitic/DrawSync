import { DomainEvent } from "./base.event";

export class StrokeUndoneEvent extends DomainEvent {
  constructor(
    public readonly roundId: string,
    public readonly drawerId: string,
    public readonly strokeId: string | null
  ) {
    super('STROKE_UNDONE');
  }

  toPayload(): Record<string, any> {
    return {
      roundId: this.roundId,
      drawerId: this.drawerId,
      strokeId: this.strokeId
    };
  }
}
