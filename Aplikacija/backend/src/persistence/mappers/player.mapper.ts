import { Player } from '../../domain/models/player.model';
import { PlayerEntity } from '../entities/player.entity';

export class PlayerMapper {
  static toDomain(entity: PlayerEntity): Player {
    return {
      id: entity.id,
      roomId: entity.roomId,
      nickname: entity.nickname,
      score: entity.score,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
