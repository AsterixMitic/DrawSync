import { Injectable } from '@nestjs/common';
import { BaseMapper } from './base.mapper';
import { Room } from '../../domain/models';
import { RoomStatus } from '../../domain/enums';
import { RoomEntity } from '../database/entities';
import { PlayerMapper } from './player.mapper';
import { RoundMapper } from './round.mapper';

@Injectable()
export class RoomMapper extends BaseMapper<Room, RoomEntity> {
  constructor(
    private readonly playerMapper: PlayerMapper,
    private readonly roundMapper: RoundMapper
  ) {
    super();
  }

  toDomain(entity: RoomEntity): Room {
    // if (!entity) return null;

    const room = new Room({
      id: entity.id,
      status: entity.status as RoomStatus,
      createdAt: entity.createdAt,
      roundCount: entity.roundCount,
      playerMaxCount: entity.playerMaxCount,
      roomOwnerId: entity.roomOwnerId ? entity.roomOwnerId : undefined,
      currentRoundId: entity.currentRoundId
    });

    if (entity.players) {
      room.setPlayers(this.playerMapper.toDomainList(entity.players));
    }

    if (entity.rounds) {
      room.setRounds(this.roundMapper.toDomainList(entity.rounds));
    }

    return room;
  }

  toEntity(domain: Room): RoomEntity {
    // if (!domain) return null;
    const entity = new RoomEntity();
    entity.id = domain.id;
    entity.status = domain.status;
    entity.createdAt = domain.createdAt;
    entity.roundCount = domain.roundCount;
    entity.playerMaxCount = domain.playerMaxCount;
    entity.roomOwnerId = domain.roomOwnerId || null;
    entity.currentRoundId = domain.currentRoundId || null;
    return entity;
  }
}