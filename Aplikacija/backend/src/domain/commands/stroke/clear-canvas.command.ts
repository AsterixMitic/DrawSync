import { Inject, Injectable } from '@nestjs/common';
import { RoundStatus } from '../../enums';
import { CanvasClearedEvent } from '../../events';
import { Result } from '../../results/base.result';
import { ClearCanvasResult, ClearCanvasResultData } from '../../results';
import type { ISharedStatePort } from '../../ports';

export interface ClearCanvasInput {
  roomId: string;
  playerId: string;
}

@Injectable()
export class ClearCanvasCommand {
  constructor(
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
  ) {}

  async execute(input: ClearCanvasInput): Promise<ClearCanvasResult> {
    if (!input.roomId || !input.playerId) {
      return Result.fail('Room ID and Player ID are required', 'VALIDATION_ERROR');
    }

    const roomState = await this.sharedState.getRoomState(input.roomId);
    if (!roomState) {
      return Result.fail('Room state not found', 'NOT_FOUND');
    }

    if (roomState.lockOwnerId !== input.playerId) {
      return Result.fail('Only the current drawer can clear the canvas', 'NOT_AUTHORIZED');
    }

    if (roomState.roundStatus !== RoundStatus.ACTIVE) {
      return Result.fail('Cannot clear canvas when round is not active', 'INVALID_STATE');
    }

    await this.sharedState.clearStrokeIds(input.roomId);

    const events = [
      new CanvasClearedEvent(roomState.currentRoundId!, input.playerId)
    ];

    return Result.ok<ClearCanvasResultData>({ events });
  }
}
