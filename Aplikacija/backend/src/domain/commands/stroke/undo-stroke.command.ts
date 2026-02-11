import { Inject, Injectable } from '@nestjs/common';
import { RoundStatus, StrokeType } from '../../enums';
import { StrokeEvent } from '../../models';
import { StrokeUndoneEvent } from '../../events';
import { Result } from '../../results/base.result';
import { UndoStrokeResult, UndoStrokeResultData } from '../../results';
import type { IRoundRepositoryPort, ISharedStatePort, IStrokeEventRepositoryPort, ISaveStrokeEventOperationPort } from '../../ports';

export interface UndoStrokeInput {
  roomId: string;
  playerId: string;
}

@Injectable()
export class UndoStrokeCommand {
  constructor(
    @Inject('IRoundRepositoryPort')
    private readonly roundRepo: IRoundRepositoryPort,
    @Inject('IStrokeEventRepositoryPort')
    private readonly strokeEventRepo: IStrokeEventRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
    @Inject('ISaveStrokeEventOperationPort')
    private readonly saveStrokeEventOp: ISaveStrokeEventOperationPort
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

    const round = await this.roundRepo.findById(roomState.currentRoundId ?? '');
    if (!round) {
      return Result.fail('Round not found', 'NOT_FOUND');
    }

    if (!round.isActive) {
      return Result.fail('Round is not active', 'INVALID_STATE');
    }

    const targetStrokeId = await this.computeUndoTarget(round.id);
    if (!targetStrokeId) {
      return Result.fail('No strokes to undo', 'INVALID_STATE');
    }

    const seq = await this.roundRepo.getNextSeqForRound(round.id);
    const strokeEvent = new StrokeEvent({
      roundId: round.id,
      seq,
      strokeType: StrokeType.UNDO,
      strokeId: targetStrokeId
    });

    const events = [
      new StrokeUndoneEvent(round.id, input.playerId, targetStrokeId)
    ];

    try {
      await this.saveStrokeEventOp.execute({ strokeEvent });
    } catch (error: any) {
      return Result.fail(`Failed to persist stroke event: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<UndoStrokeResultData>({
      strokeEvent,
      undoneStrokeId: targetStrokeId,
      events
    });
  }

  private async computeUndoTarget(roundId: string): Promise<string | null> {
    const strokeEvents = await this.strokeEventRepo.findByRoundId(roundId);

    const stack: string[] = [];
    for (const event of strokeEvents) {
      switch (event.strokeType) {
        case StrokeType.DRAW:
          if (event.strokeId) {
            stack.push(event.strokeId);
          }
          break;
        case StrokeType.UNDO:
          if (stack.length > 0) {
            stack.pop();
          }
          break;
        case StrokeType.CLEAR:
          stack.length = 0;
          break;
        default:
          break;
      }
    }

    return stack.length > 0 ? stack[stack.length - 1] : null;
  }
}
