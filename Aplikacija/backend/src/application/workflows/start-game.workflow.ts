import { Injectable } from '@nestjs/common';
import { RoomDomainApi } from '../../domain/api';
import { Result } from '../../domain/results/base.result';
import { DomainEvent } from '../../domain/events';

export interface StartGameInput {
  roomId: string;
  userId: string;
}

export interface StartGameResultData {
  roomId: string;
  nextDrawerId: string | null;
  events: DomainEvent[];
}

@Injectable()
export class StartGameWorkflow {
  constructor(
    private readonly roomDomainApi: RoomDomainApi,
  ) {}

  async execute(input: StartGameInput): Promise<Result<StartGameResultData>> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }

    const startResult = await this.roomDomainApi.startGame({
      roomId: input.roomId,
      userId: input.userId,
    });

    if (startResult.isFailure()) {
      return Result.fail(startResult.error ?? 'Failed to start game', startResult.errorCode);
    }

    return Result.ok({
      roomId: input.roomId,
      nextDrawerId: startResult.data!.nextDrawerId,
      events: startResult.data?.events ?? [],
    });
  }
}
