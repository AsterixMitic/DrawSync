import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { StrokeEntity } from '../database/entities/stroke.entity.js';
import { StrokeEventEntity } from '../database/entities/stroke-event.entity.js';

@Injectable()
export class StrokeEventHandler {
  private readonly logger = new Logger(StrokeEventHandler.name);

  constructor(
    @InjectRepository(StrokeEntity)
    private readonly strokeRepo: Repository<StrokeEntity>,
    @InjectRepository(StrokeEventEntity)
    private readonly strokeEventRepo: Repository<StrokeEventEntity>,
  ) {}

  async handleStrokeApplied(payload: Record<string, any>): Promise<void> {
    const { roundId, strokeId, points, style } = payload;

    await this.strokeRepo.insert({
      id: strokeId,
      roundId,
      points,
      style,
    });

    const seq = await this.nextSeq(roundId);
    await this.strokeEventRepo.insert({
      eventId: randomUUID(),
      roundId,
      seq,
      strokeType: 'DRAW',
      strokeId,
    });

    this.logger.log(`Stroke ${strokeId} persisted (DRAW seq=${seq}) in round ${roundId}`);
  }

  async handleStrokeUndone(payload: Record<string, any>): Promise<void> {
    const { roundId, strokeId } = payload;

    const seq = await this.nextSeq(roundId);
    await this.strokeEventRepo.insert({
      eventId: randomUUID(),
      roundId,
      seq,
      strokeType: 'UNDO',
      strokeId: strokeId ?? null,
    });

    this.logger.log(`StrokeEvent UNDO seq=${seq} persisted in round ${roundId}`);
  }

  async handleCanvasCleared(payload: Record<string, any>): Promise<void> {
    const { roundId } = payload;

    const seq = await this.nextSeq(roundId);
    await this.strokeEventRepo.insert({
      eventId: randomUUID(),
      roundId,
      seq,
      strokeType: 'CLEAR',
      strokeId: null,
    });

    this.logger.log(`StrokeEvent CLEAR seq=${seq} persisted in round ${roundId}`);
  }

  private async nextSeq(roundId: string): Promise<number> {
    const result = await this.strokeEventRepo
      .createQueryBuilder('se')
      .select('MAX(se.seq)', 'max')
      .where('se.roundId = :roundId', { roundId })
      .getRawOne();
    return (result?.max ?? 0) + 1;
  }
}
