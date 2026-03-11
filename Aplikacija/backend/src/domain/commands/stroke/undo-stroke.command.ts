import { Inject, Injectable } from '@nestjs/common';
import { RoundStatus } from '../../enums';
import { StrokeUndoneEvent } from '../../events';
import { Result } from '../../results/base.result';
import { UndoStrokeResult, UndoStrokeResultData } from '../../results';
import type { ISharedStatePort } from '../../ports';

export interface UndoStrokeInput {
  roomId: string;
  playerId: string;
}

@Injectable()
export class UndoStrokeCommand {
  constructor(
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
  ) {}

  async execute(input: UndoStrokeInput): Promise<UndoStrokeResult> {
    if (!input.roomId || !input.playerId) {
      return Result.fail('Room ID and Player ID are required', 'VALIDATION_ERROR');
    }

    const roomState = await this.sharedState.getRoomState(input.roomId);
    if (!roomState) {
      return Result.fail('Room state not found', 'NOT_FOUND');
    }

    if (roomState.lockOwnerId !== input.playerId) {
      return Result.fail('Only the current drawer can undo strokes', 'NOT_AUTHORIZED');
    }

    if (roomState.roundStatus !== RoundStatus.ACTIVE) {
      return Result.fail('Cannot undo stroke when round is not active', 'INVALID_STATE');
    }

    const targetStrokeId = await this.sharedState.popStrokeId(input.roomId);
    if (!targetStrokeId) {
      return Result.fail('No strokes to undo', 'INVALID_STATE');
    }

    const events = [
      new StrokeUndoneEvent(roomState.currentRoundId!, input.playerId, targetStrokeId)
    ];

    return Result.ok<UndoStrokeResultData>({
      undoneStrokeId: targetStrokeId,
      events
    });
  }
}
