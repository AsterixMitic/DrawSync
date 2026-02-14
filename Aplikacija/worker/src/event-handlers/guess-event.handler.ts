import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GuessEventHandler {
  private readonly logger = new Logger(GuessEventHandler.name);

  async handleGuessSubmitted(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Guess submitted in round ${payload.roundId} by player ${payload.playerId} - correct: ${payload.isCorrect}`,
    );
  }
}
