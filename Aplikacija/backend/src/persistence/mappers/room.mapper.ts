import { Room } from '../../domain/models/room.model';
import { RoomEntity } from '../entities/room.entity';
import { PlayerMapper } from './player.mapper';
import { RoundMapper } from './round.mapper';

export class RoomMapper {
  static toDomain(entity: RoomEntity, includeRounds = true, includePlayers = true): Room {
    return {
      id: entity.id,
      code: entity.code,
      name: entity.name,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      rounds: includeRounds && entity.rounds ? entity.rounds.map(RoundMapper.toDomain) : undefined,
      players: includePlayers && entity.players ? entity.players.map(PlayerMapper.toDomain) : undefined,
    };
  }
}
