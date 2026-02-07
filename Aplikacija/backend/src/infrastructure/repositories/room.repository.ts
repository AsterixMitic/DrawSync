import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../domain/models';
import { RoomStatus } from '../../domain/enums';
import { IRoomRepositoryPort } from '../../domain/ports';
import { RoomEntity } from '../database/entities';
import { RoomMapper } from '../mappers';

@Injectable()
export class RoomRepository implements IRoomRepositoryPort {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
    private readonly mapper: RoomMapper
  ) {}

  async findById(id: string): Promise<Room | null> {
    const entity = await this.roomRepo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdWithPlayers(id: string): Promise<Room | null> {
    const entity = await this.roomRepo.findOne({
      where: { id },
      relations: { players: true }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdWithRounds(id: string): Promise<Room | null> {
    const entity = await this.roomRepo.findOne({
      where: { id },
      relations: { rounds: true }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdFull(id: string): Promise<Room | null> {
    const entity = await this.roomRepo.findOne({
      where: { id },
      relations: {
        players: true,
        rounds: {
          strokes: true,
          guesses: true
        }
      }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByStatus(status: RoomStatus): Promise<Room[]> {
    const entities = await this.roomRepo.find({ where: { status } });
    return this.mapper.toDomainList(entities);
  }

  async findAvailableRooms(): Promise<Room[]> {
    const entities = await this.roomRepo.find({
      where: { status: RoomStatus.WAITING },
      relations: { players: true }
    });
    return this.mapper.toDomainList(entities).filter((room) => !room.isFull);
  }

  async exists(id: string): Promise<boolean> {
    return this.roomRepo.exist({ where: { id } });
  }
}
