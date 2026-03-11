import { Inject, Injectable } from '@nestjs/common';
import { Stroke } from '../../models';
import { StrokePoint, StrokeStyle } from '../../value-objects';
import { RoundStatus } from '../../enums';
import { ApplyStrokeResult, ApplyStrokeResultData } from '../../results';
import { Result } from '../../results/base.result';
import { StrokeAppliedEvent } from '../../events';
import type { ISharedStatePort } from '../../ports';

export interface ApplyStrokeInput {
  roomId: string;
  playerId: string;
  points: Array<{ x: number; y: number; pressure?: number; timestamp?: number }>;
  style: { color: string; lineWidth: number; lineCap?: 'round' | 'square' | 'butt'; opacity?: number };
}

@Injectable()
export class ApplyStrokeCommand {
  constructor(
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
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

    const stroke = new Stroke({
      roundId: roomState.currentRoundId!,
      points: input.points.map((p) => new StrokePoint(p)),
      style: new StrokeStyle(input.style)
    });

    await this.sharedState.pushStrokeId(input.roomId, stroke.id);

    const events = [
      new StrokeAppliedEvent(
        roomState.currentRoundId!,
        stroke.id,
        input.playerId,
        stroke.points as StrokePoint[],
        stroke.style
      )
    ];

    return Result.ok<ApplyStrokeResultData>({ stroke, events });
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
