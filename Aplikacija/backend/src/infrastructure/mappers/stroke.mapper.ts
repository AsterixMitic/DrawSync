import { Injectable } from '@nestjs/common';
import { BaseMapper } from './base.mapper';
import { Stroke } from '../../domain/models';
import { StrokePoint, StrokeStyle } from '../../domain/value-objects';
import { StrokeEntity } from '../database/entities';

@Injectable()
export class StrokeMapper extends BaseMapper<Stroke, StrokeEntity> {
  toDomain(entity: StrokeEntity): Stroke {
    // if (!entity) return null;

    const points = (entity.points as any[]).map(
      (p) => new StrokePoint({ x: p.x, y: p.y, pressure: p.pressure, timestamp: p.timestamp })
    );

    const styleData = entity.style as any;
    const style = new StrokeStyle({
      color: styleData.color,
      lineWidth: styleData.lineWidth,
      lineCap: styleData.lineCap,
      opacity: styleData.opacity
    });

    return new Stroke({
      id: entity.id,
      roundId: entity.roundId,
      createdAt: entity.createdAt,
      points,
      style
    });
  }

  toEntity(domain: Stroke): StrokeEntity {
    // if (!domain) return null;
    const entity = new StrokeEntity();
    entity.id = domain.id;
    entity.roundId = domain.roundId;
    entity.createdAt = domain.createdAt;
    entity.points = domain.points.map((p) => p.toJSON());
    entity.style = domain.style.toJSON();
    return entity;
  }
}