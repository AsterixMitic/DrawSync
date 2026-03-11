import { Inject, Injectable } from '@nestjs/common';
import { Guess } from '../../models';
import { Result } from '../../results/base.result';
import { SubmitGuessResult, SubmitGuessResultData } from '../../results';
import { CorrectGuessEvent, GuessSubmittedEvent } from '../../events';
import type { DomainEvent } from '../../events';
import type {
  IPlayerRepositoryPort,
  IRoundRepositoryPort,
  ISharedStatePort
} from '../../ports';

export interface SubmitGuessInput {
  roundId: string;
  playerId: string;
  guessText: string;
}

@Injectable()
export class SubmitGuessCommand {
  constructor(
    @Inject('IRoundRepositoryPort')
    private readonly roundRepo: IRoundRepositoryPort,
    @Inject('IPlayerRepositoryPort')
    private readonly playerRepo: IPlayerRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
  ) {}

  async execute(input: SubmitGuessInput): Promise<SubmitGuessResult> {
    if (!input.roundId) {
      return Result.fail('Round ID is required', 'VALIDATION_ERROR');
    }
    if (!input.playerId) {
      return Result.fail('Player ID is required', 'VALIDATION_ERROR');
    }
    if (!input.guessText || input.guessText.trim() === '') {
      return Result.fail('Guess text is required', 'VALIDATION_ERROR');
    }

    const round = await this.roundRepo.findById(input.roundId);
    if (!round) {
      return Result.fail('Round not found', 'NOT_FOUND');
    }

    const player = await this.playerRepo.findById(input.playerId);
    if (!player) {
      return Result.fail('Player not found', 'NOT_FOUND');
    }

    if (!round.isActive) {
      return Result.fail('Round is not active', 'INVALID_STATE');
    }

    if (round.currentDrawerId === input.playerId) {
      return Result.fail('Drawer cannot guess', 'NOT_AUTHORIZED');
    }

    const alreadyGuessed = await this.sharedState.hasCorrectGuesser(round.roomId, input.playerId);
    if (alreadyGuessed) {
      return Result.fail('Player has already guessed correctly', 'ALREADY_GUESSED');
    }

    const guess = new Guess({
      roundId: round.id,
      playerId: input.playerId,
      guessText: input.guessText.trim()
    });

    let isCorrect: boolean;
    try {
      isCorrect = round.addGuess(guess);
    } catch (error: any) {
      return Result.fail(error?.message ?? 'Failed to add guess', 'DOMAIN_ERROR');
    }

    let pointsAwarded = 0;
    let allGuessersCorrect = false;
    if (isCorrect) {
      const previousCorrectCount = await this.sharedState.getCorrectGuesserCount(round.roomId);
      pointsAwarded = this.calculatePoints(previousCorrectCount);

      await this.sharedState.addCorrectGuesser(round.roomId, input.playerId);

      const roomPlayers = await this.playerRepo.findByRoomId(round.roomId);
      const guesserCount = roomPlayers.filter(p => p.playerId !== round.currentDrawerId).length;
      allGuessersCorrect = (previousCorrectCount + 1) >= guesserCount;
    }

    const events: DomainEvent[] = [
      new GuessSubmittedEvent(
        round.id,
        guess.id,
        input.playerId,
        guess.guessText,
        isCorrect,
        pointsAwarded
      )
    ];

    if (isCorrect) {
      events.push(new CorrectGuessEvent(round.id, input.playerId, pointsAwarded));
    }

    return Result.ok<SubmitGuessResultData>({
      guess,
      isCorrect,
      pointsAwarded,
      allGuessersCorrect,
      events
    });
  }

  private calculatePoints(previousCorrectGuesses: number): number {
    const basePoints = 100;
    const decrement = 20;
    const minPoints = 20;
    return Math.max(basePoints - (previousCorrectGuesses * decrement), minPoints);
  }
}
