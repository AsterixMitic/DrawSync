import { Stroke, StrokeEvent } from "src/domain/models";
import { Result } from "../base.result";
import { DomainEvent } from "src/domain/events/base.event";

export interface ApplyStrokeResultData {
  stroke: Stroke;
  strokeEvent: StrokeEvent;
  events: DomainEvent[];
}

export type ApplyStrokeResult = Result<ApplyStrokeResultData>;