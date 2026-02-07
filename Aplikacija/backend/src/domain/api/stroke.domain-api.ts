import { Injectable } from '@nestjs/common';
import { ApplyStrokeCommand } from '../commands/stroke/apply-stroke.command';
import { ClearCanvasCommand } from '../commands/stroke/clear-canvas.command';
import { UndoStrokeCommand } from '../commands/stroke/undo-stroke.command';
import { ApplyStrokeInput, ClearCanvasInput, UndoStrokeInput } from '../commands/stroke';
import { ApplyStrokeResult, ClearCanvasResult, UndoStrokeResult } from '../results/stroke';

@Injectable()
export class StrokeDomainApi {
  constructor(
    private readonly applyStrokeCommand: ApplyStrokeCommand,
    private readonly clearCanvasCommand: ClearCanvasCommand,
    private readonly undoStrokeCommand: UndoStrokeCommand
  ) {}

  async applyStroke(input: ApplyStrokeInput): Promise<ApplyStrokeResult> {
    return this.applyStrokeCommand.execute(input);
  }

  async clearCanvas(input: ClearCanvasInput): Promise<ClearCanvasResult> {
    return this.clearCanvasCommand.execute(input);
  }

  async undoStroke(input: UndoStrokeInput): Promise<UndoStrokeResult> {
    return this.undoStrokeCommand.execute(input);
  }
}
