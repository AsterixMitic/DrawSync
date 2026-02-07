import { Inject, Injectable } from '@nestjs/common';
import { StrokeDomainApi } from '../../domain/api';
import { ApplyStrokeResult, ClearCanvasResult, UndoStrokeResult } from '../../domain/results';
import { IEventPublisherPort } from '../../domain/ports';

export interface ApplyStrokeRequest {
  roomId: string;
  playerId: string;
  points: Array<{ x: number; y: number; pressure?: number; timestamp?: number }>;
  style: { color: string; lineWidth: number; lineCap?: 'round' | 'square' | 'butt'; opacity?: number };
}

export interface ClearCanvasRequest {
  roomId: string;
  playerId: string;
}

export interface UndoStrokeRequest {
  roomId: string;
  playerId: string;
}

@Injectable()
export class StrokeClientApi {
  constructor(
    private readonly strokeDomainApi: StrokeDomainApi,
    @Inject('IEventPublisherPort')
    private readonly eventPublisher: IEventPublisherPort
  ) {}

  async applyStroke(request: ApplyStrokeRequest): Promise<ApplyStrokeResult> {
    const result = await this.strokeDomainApi.applyStroke({
      roomId: request.roomId,
      playerId: request.playerId,
      points: request.points,
      style: request.style
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }

  async clearCanvas(request: ClearCanvasRequest): Promise<ClearCanvasResult> {
    const result = await this.strokeDomainApi.clearCanvas({
      roomId: request.roomId,
      playerId: request.playerId
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }

  async undoStroke(request: UndoStrokeRequest): Promise<UndoStrokeResult> {
    const result = await this.strokeDomainApi.undoStroke({
      roomId: request.roomId,
      playerId: request.playerId
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }
}
