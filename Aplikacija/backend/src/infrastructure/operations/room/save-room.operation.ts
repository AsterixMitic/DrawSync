import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../../domain/models';
import { ISaveRoomOperationPort } from '../../../domain/ports';
import { RoomEntity } from '../../database/entities';
import { RoomMapper } from '../../mappers';

export interface SaveRoomInput {
  room: Room;
}

@Injectable()
export class SaveRoomOperation implements ISaveRoomOperationPort {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
    private readonly mapper: RoomMapper
  ) {}

  async execute(input: SaveRoomInput): Promise<void> {
    const entity = this.mapper.toEntity(input.room);
    await this.roomRepo.save(entity);
  }
}
