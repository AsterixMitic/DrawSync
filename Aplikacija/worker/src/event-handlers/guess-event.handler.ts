import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuessEntity } from '../database/entities/guess.entity.js';

@Injectable()
export class GuessEventHandler {
  private readonly logger = new Logger(GuessEventHandler.name);

  constructor(
    @InjectRepository(GuessEntity)
    private readonly guessRepo: Repository<GuessEntity>,
  ) {}

  async handleGuessSubmitted(payload: Record<string, any>): Promise<void> {
    const { guessId, roundId, playerId, guessText, isCorrect } = payload;

    await this.guessRepo.insert({
      id: guessId,
      roundId,
      playerId,
      guessText,
      time: new Date(),
      rightGuess: isCorrect,
    });

    this.logger.log(
      `Guess ${guessId} persisted in round ${roundId} by player ${playerId} (correct: ${isCorrect})`,
    );
  }
}
