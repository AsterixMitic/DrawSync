import { DomainEvent } from "./base.event";

export class CanvasClearedEvent extends DomainEvent {
  constructor(
    public readonly roundId: string,
    public readonly drawerId: string
  ) {
    super('CANVAS_CLEARED');
  }

  toPayload(): Record<string, any> {
    return {
      roundId: this.roundId,
      drawerId: this.drawerId
    };
  }
}
