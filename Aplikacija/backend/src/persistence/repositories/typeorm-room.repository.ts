import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../domain/models/room.model';
import { RoomStatus } from '../../domain/models/statuses';
import { CreateRoomPayload, RoomRepository } from '../../domain/repositories/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { RoomMapper } from '../mappers/room.mapper';

@Injectable()
export class TypeOrmRoomRepository extends RoomRepository {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>
  ) {
    super();
  }

  async create(payload: CreateRoomPayload): Promise<Room> {
    const entity = this.roomRepository.create({
      code: payload.code,
      name: payload.name,
      status: RoomStatus.Waiting,
    });
    const saved = await this.roomRepository.save(entity);
    return RoomMapper.toDomain(saved, false, false);
  }

  async findById(id: string): Promise<Room | null> {
    const entity = await this.roomRepository.findOne({
      where: { id },
      relations: {
        rounds: true,
        players: true,
      },
    });
    return entity ? RoomMapper.toDomain(entity) : null;
  }
}
