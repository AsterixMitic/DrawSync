import { Inject, Injectable } from '@nestjs/common';
import { RoundStatus, StrokeType } from '../../enums';
import { StrokeEvent } from '../../models';
import { CanvasClearedEvent } from '../../events';
import { Result } from '../../results/base.result';
import { ClearCanvasResult, ClearCanvasResultData } from '../../results';
import { IRoundRepositoryPort, ISharedStatePort } from '../../ports';
import { SaveStrokeEventOperation } from '../../../infrastructure/operations/stroke/save-stroke-event.operation';

export interface ClearCanvasInput {
  roomId: string;
  playerId: string;
}

@Injectable()
export class ClearCanvasCommand {
  constructor(
    @Inject('IRoundRepositoryPort')
    private readonly roundRepo: IRoundRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
    private readonly saveStrokeEventOp: SaveStrokeEventOperation
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

    const round = await this.roundRepo.findById(roomState.currentRoundId ?? '');
    if (!round) {
      return Result.fail('Round not found', 'NOT_FOUND');
    }
    if (!round.isActive) {
      return Result.fail('Round is not active', 'INVALID_STATE');
    }

    const seq = await this.roundRepo.getNextSeqForRound(round.id);
    const strokeEvent = new StrokeEvent({
      roundId: round.id,
      seq,
      strokeType: StrokeType.CLEAR
    });

    const events = [
      new CanvasClearedEvent(round.id, input.playerId)
    ];

    try {
      await this.saveStrokeEventOp.execute({ strokeEvent });
    } catch (error: any) {
      return Result.fail(`Failed to persist stroke event: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<ClearCanvasResultData>({
      strokeEvent,
      events
    });
  }
}
