import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class StrokeEventHandler {
  private readonly logger = new Logger(StrokeEventHandler.name);

  async handleStrokeApplied(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Stroke ${payload.strokeId} applied in round ${payload.roundId} by drawer ${payload.drawerId}`,
    );
  }

  async handleStrokeUndone(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Stroke undone in round ${payload.roundId} by drawer ${payload.drawerId}`,
    );
  }

  async handleCanvasCleared(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Canvas cleared in round ${payload.roundId} by drawer ${payload.drawerId}`,
    );
  }
}
