import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ScoreEventHandler {
  private readonly logger = new Logger(ScoreEventHandler.name);

  async handleCorrectGuess(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Correct guess by player ${payload.playerId} in round ${payload.roundId} - points: ${payload.pointsAwarded}`,
    );
  }
}
