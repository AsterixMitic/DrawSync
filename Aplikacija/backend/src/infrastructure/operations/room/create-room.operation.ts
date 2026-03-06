import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Room } from '../../../domain/models/room.model';
import { Player } from '../../../domain/models/player.model';
import { ICreateRoomOperationPort } from '../../../domain/ports';
import { RoomEntity, PlayerEntity } from '../../database/entities';
import { RoomMapper } from '../../mappers/room.mapper';
import { PlayerMapper } from '../../mappers/player.mapper';

@Injectable()
export class CreateRoomOperation implements ICreateRoomOperationPort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly roomMapper: RoomMapper,
    private readonly playerMapper: PlayerMapper,
  ) {}

  async execute(input: { room: Room; player: Player }): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Save room with owner = null first (circular FK: room -> player -> room)
      input.room.setRoomOwner(null);
      await manager.save(RoomEntity, this.roomMapper.toEntity(input.room));

      // Save player (room exists now)
      await manager.save(PlayerEntity, this.playerMapper.toEntity(input.player));

      // Update room with owner reference
      input.room.setRoomOwner(input.player.playerId);
      await manager.save(RoomEntity, this.roomMapper.toEntity(input.room));
    });
  }
}
