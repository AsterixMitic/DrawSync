import { Injectable } from '@nestjs/common';
import { BaseMapper } from './base.mapper';
import { StrokeEvent } from '../../domain/models';
import { StrokeType } from '../../domain/enums';
import { StrokeEventEntity } from '../database/entities';
import { StrokeMapper } from './stroke.mapper';

@Injectable()
export class StrokeEventMapper extends BaseMapper<StrokeEvent, StrokeEventEntity> {
  constructor(private readonly strokeMapper: StrokeMapper) {
    super();
  }

  toDomain(entity: StrokeEventEntity): StrokeEvent {
    // if (!entity) return null;
    return new StrokeEvent({
      eventId: entity.eventId,
      roundId: entity.roundId,
      seq: entity.seq,
      strokeType: entity.strokeType as StrokeType,
      createdAt: entity.createdAt,
      strokeId: entity.strokeId,
      stroke: entity.stroke ? this.strokeMapper.toDomain(entity.stroke) : undefined
    });
  }

  toEntity(domain: StrokeEvent): StrokeEventEntity {
    // if (!domain) return null;
    const entity = new StrokeEventEntity();
    entity.eventId = domain.eventId;
    entity.roundId = domain.roundId;
    entity.seq = domain.seq;
    entity.strokeType = domain.strokeType;
    entity.createdAt = domain.createdAt;
    entity.strokeId = domain.strokeId;
    return entity;
  }
}