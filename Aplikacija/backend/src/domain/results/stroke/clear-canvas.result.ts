import { DomainEvent } from "src/domain/events/base.event";
import { Result } from "../base.result";

export interface ClearCanvasResultData {
  events: DomainEvent[];
}

export type ClearCanvasResult = Result<ClearCanvasResultData>;
