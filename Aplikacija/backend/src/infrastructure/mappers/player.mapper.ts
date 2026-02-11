import { Injectable } from '@nestjs/common';
import { BaseMapper } from './base.mapper';
import { Player } from '../../domain/models';
import { PlayerState } from '../../domain/enums';
import { PlayerEntity } from '../database/entities';
import { UserMapper } from './user.mapper';

@Injectable()
export class PlayerMapper extends BaseMapper<Player, PlayerEntity> {
  constructor(private readonly userMapper: UserMapper) {
    super();
  }

  toDomain(entity: PlayerEntity): Player {
    // if (!entity) return null;
    return new Player({
      playerId: entity.playerId,
      userId: entity.userId,
      roomId: entity.roomId,
      score: entity.score,
      state: entity.playerState as PlayerState,
      user: entity.user ? this.userMapper.toDomain(entity.user) : undefined
    });
  }

  toEntity(domain: Player): PlayerEntity {
    // if (!domain) return null;
    const entity = new PlayerEntity();
    entity.playerId = domain.playerId;
    entity.userId = domain.userId;
    entity.roomId = domain.roomId;
    entity.score = domain.score;
    entity.playerState = domain.state;
    return entity;
  }
}