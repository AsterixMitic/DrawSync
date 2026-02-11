import { Injectable } from '@nestjs/common';
import { RoomDomainApi, RoundDomainApi } from '../../domain/api';
import { Result } from '../../domain/results/base.result';
import { Round } from '../../domain/models';
import { DomainEvent } from '../../domain/events';

export interface StartGameInput {
  roomId: string;
  words: string[];
}

export interface StartGameResultData {
  roomId: string;
  firstRound: Round;
  drawerId: string;
  events: DomainEvent[];
}

@Injectable()
export class StartGameWorkflow {
  constructor(
    private readonly roomDomainApi: RoomDomainApi,
    private readonly roundDomainApi: RoundDomainApi
  ) {}

  async execute(input: StartGameInput): Promise<Result<StartGameResultData>> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }
    if (!input.words || input.words.length === 0) {
      return Result.fail('At least one word is required', 'VALIDATION_ERROR');
    }

    const startResult = await this.roomDomainApi.startGame({
      roomId: input.roomId
    });

    if (startResult.isFailure()) {
      return Result.fail(startResult.error ?? 'Failed to start game', startResult.errorCode);
    }

    const roundResult = await this.roundDomainApi.startRound({
      roomId: input.roomId,
      word: input.words[0]
    });

    if (roundResult.isFailure()) {
      return Result.fail(roundResult.error ?? 'Failed to start game', roundResult.errorCode);
    }

    const events: DomainEvent[] = [
      ...(startResult.data?.events ?? []),
      ...(roundResult.data?.events ?? [])
    ];

    return Result.ok({
      roomId: input.roomId,
      firstRound: roundResult.data!.round,
      drawerId: roundResult.data!.drawerId,
      events
    });
  }
}
