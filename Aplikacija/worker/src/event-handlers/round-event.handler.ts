import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RoundEventHandler {
  private readonly logger = new Logger(RoundEventHandler.name);

  async handleRoundStarted(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Round ${payload.roundNo} started in room ${payload.roomId} - drawer: ${payload.drawerId}`,
    );
  }

  async handleRoundCompleted(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Round ${payload.roundNo} completed in room ${payload.roomId} - game finished: ${payload.isGameFinished}`,
    );
  }
}
