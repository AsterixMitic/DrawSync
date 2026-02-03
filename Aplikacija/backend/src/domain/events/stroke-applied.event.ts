import { StrokePoint, StrokeStyle } from "../value-objects";
import { DomainEvent } from "./base.event";

export class StrokeAppliedEvent extends DomainEvent {
  constructor(
    public readonly roundId: string,
    public readonly strokeId: string,
    public readonly drawerId: string,
    public readonly points: StrokePoint[],
    public readonly style: StrokeStyle
  ) {
    super('STROKE_APPLIED');
  }

  toPayload(): Record<string, any> {
    return {
      roundId: this.roundId,
      strokeId: this.strokeId,
      drawerId: this.drawerId,
      points: this.points.map(p => p.toJSON()),
      style: this.style.toJSON()
    };
  }
}