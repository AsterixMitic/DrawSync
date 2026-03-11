import { DomainEvent } from "src/domain/events/base.event";
import { Result } from "../base.result";

export interface UndoStrokeResultData {
  undoneStrokeId: string | null;
  events: DomainEvent[];
}

export type UndoStrokeResult = Result<UndoStrokeResultData>;
