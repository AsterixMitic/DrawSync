import { Inject, Injectable } from '@nestjs/common';
import { Stroke, StrokeEvent } from '../../models';
import { StrokePoint, StrokeStyle } from '../../value-objects';
import { RoundStatus, StrokeType } from '../../enums';
import { ApplyStrokeResult, ApplyStrokeResultData } from '../../results';
import { Result } from '../../results/base.result';
import { StrokeAppliedEvent } from '../../events';
import { IRoundRepositoryPort, ISharedStatePort } from '../../ports';
import { SaveStrokeOperation } from '../../../infrastructure/operations/stroke/save-stroke.operation';
import { SaveStrokeEventOperation } from '../../../infrastructure/operations/stroke/save-stroke-event.operation';

export interface ApplyStrokeInput {
  roomId: string;
  playerId: string;
  points: Array<{ x: number; y: number; pressure?: number; timestamp?: number }>;
  style: { color: string; lineWidth: number; lineCap?: 'round' | 'square' | 'butt'; opacity?: number };
}

@Injectable()
export class ApplyStrokeCommand {
  constructor(
    @Inject('IRoundRepositoryPort')
    private readonly roundRepo: IRoundRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
    private readonly saveStrokeOp: SaveStrokeOperation,
    private readonly saveStrokeEventOp: SaveStrokeEventOperation
  ) {}

  async execute(input: ApplyStrokeInput): Promise<ApplyStrokeResult> {
    const validationError = this.validateInput(input);
    if (validationError) {
      return Result.fail(validationError, 'VALIDATION_ERROR');
    }

    const roomState = await this.sharedState.getRoomState(input.roomId);
    if (!roomState) {
      return Result.fail('Room state not found', 'NOT_FOUND');
    }

    if (roomState.lockOwnerId !== input.playerId) {
      return Result.fail('Only the current drawer can apply strokes', 'NOT_AUTHORIZED');
    }

    if (roomState.roundStatus !== RoundStatus.ACTIVE) {
      return Result.fail('Cannot draw when round is not active', 'INVALID_STATE');
    }

    const round = await this.roundRepo.findById(roomState.currentRoundId ?? '');
    if (!round) {
      return Result.fail('Round not found', 'NOT_FOUND');
    }

    const stroke = new Stroke({
      roundId: round.id,
      points: input.points.map((p) => new StrokePoint(p)),
      style: new StrokeStyle(input.style)
    });

    const seq = await this.roundRepo.getNextSeqForRound(round.id);

    const strokeEvent = new StrokeEvent({
      roundId: round.id,
      seq,
      strokeType: StrokeType.DRAW,
      strokeId: stroke.id,
      stroke
    });

    try {
      round.addStroke(stroke);
    } catch (error: any) {
      return Result.fail(error?.message ?? 'Failed to add stroke', 'DOMAIN_ERROR');
    }

    const events = [
      new StrokeAppliedEvent(round.id, stroke.id, input.playerId, stroke.points as StrokePoint[], stroke.style)
    ];

    try {
      await this.saveStrokeOp.execute({ stroke });
      await this.saveStrokeEventOp.execute({ strokeEvent });
    } catch (error: any) {
      return Result.fail(`Failed to persist stroke: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<ApplyStrokeResultData>({
      stroke,
      strokeEvent,
      events
    });
  }

  private validateInput(input: ApplyStrokeInput): string | null {
    if (!input.roomId) return 'Room ID is required';
    if (!input.playerId) return 'Player ID is required';
    if (!input.points || input.points.length === 0) return 'Points are required';
    if (!input.style) return 'Style is required';
    if (!input.style.color) return 'Color is required';
    if (input.style.lineWidth <= 0) return 'Line width must be positive';
    return null;
  }
}
