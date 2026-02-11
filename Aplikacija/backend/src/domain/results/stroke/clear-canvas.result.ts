import { StrokeEvent } from "src/domain/models";
import { DomainEvent } from "src/domain/events/base.event";
import { Result } from "../base.result";

export interface ClearCanvasResultData {
  strokeEvent: StrokeEvent;
  events: DomainEvent[];
}

export type ClearCanvasResult = Result<ClearCanvasResultData>;
