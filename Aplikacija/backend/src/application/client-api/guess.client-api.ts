import { Inject, Injectable } from '@nestjs/common';
import { GuessDomainApi } from '../../domain/api';
import { SubmitGuessResult } from '../../domain/results';
import type { IEventPublisherPort } from '../../domain/ports';

export interface SubmitGuessRequest {
  roundId: string;
  playerId: string;
  guessText: string;
}

@Injectable()
export class GuessClientApi {
  constructor(
    private readonly guessDomainApi: GuessDomainApi,
    @Inject('IEventPublisherPort')
    private readonly eventPublisher: IEventPublisherPort
  ) {}

  async submitGuess(request: SubmitGuessRequest): Promise<SubmitGuessResult> {
    const result = await this.guessDomainApi.submitGuess({
      roundId: request.roundId,
      playerId: request.playerId,
      guessText: request.guessText
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }
}
