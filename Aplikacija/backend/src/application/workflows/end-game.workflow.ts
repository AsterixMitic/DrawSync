import { Injectable } from '@nestjs/common';
import { RoundDomainApi } from '../../domain/api';
import { Result } from '../../domain/results/base.result';
import { RoomStatus } from '../../domain/enums';

export interface EndGameInput {
  roomId: string;
}

export interface EndGameResultData {
  roomId: string;
  roundId: string;
  roomStatus: RoomStatus;
}

@Injectable()
export class EndGameWorkflow {
  constructor(private readonly roundDomainApi: RoundDomainApi) {}

  async execute(input: EndGameInput): Promise<Result<EndGameResultData>> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }

    const completeResult = await this.roundDomainApi.completeRound({
      roomId: input.roomId
    });

    if (completeResult.isFailure()) {
      return Result.fail(completeResult.error ?? 'Failed to complete round', completeResult.errorCode);
    }

    return Result.ok({
      roomId: input.roomId,
      roundId: completeResult.data!.round.id,
      roomStatus: completeResult.data!.roomStatus
    });
  }
}
