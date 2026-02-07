import { Inject, Injectable } from '@nestjs/common';
import { RoundDomainApi } from '../../domain/api';
import { CompleteRoundResult, StartRoundResult } from '../../domain/results';
import { IEventPublisherPort } from '../../domain/ports';

export interface StartRoundRequest {
  roomId: string;
  word: string;
}

export interface CompleteRoundRequest {
  roomId: string;
}

@Injectable()
export class RoundClientApi {
  constructor(
    private readonly roundDomainApi: RoundDomainApi,
    @Inject('IEventPublisherPort')
    private readonly eventPublisher: IEventPublisherPort
  ) {}

  async startRound(request: StartRoundRequest): Promise<StartRoundResult> {
    const result = await this.roundDomainApi.startRound({
      roomId: request.roomId,
      word: request.word
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }

  async completeRound(request: CompleteRoundRequest): Promise<CompleteRoundResult> {
    const result = await this.roundDomainApi.completeRound({
      roomId: request.roomId
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }
}
