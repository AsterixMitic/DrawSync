import { Round } from '../../domain/models/round.model';
import { RoundEntity } from '../entities/round.entity';

export class RoundMapper {
  static toDomain(entity: RoundEntity): Round {
    return {
      id: entity.id,
      roomId: entity.roomId,
      roundNumber: entity.roundNumber,
      word: entity.word ?? null,
      status: entity.status,
      durationSeconds: entity.durationSeconds ?? null,
      startedAt: entity.startedAt ?? null,
      endedAt: entity.endedAt ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
