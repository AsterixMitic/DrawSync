import { StrokeEvent } from "src/domain/models";
import { DomainEvent } from "src/domain/events/base.event";
import { Result } from "../base.result";

export interface UndoStrokeResultData {
  strokeEvent: StrokeEvent;
  undoneStrokeId: string | null;
  events: DomainEvent[];
}

export type UndoStrokeResult = Result<UndoStrokeResultData>;
