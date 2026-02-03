import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../../domain/models/player.model';
import { CreatePlayerPayload, PlayerRepository } from '../../domain/repositories/player.repository';
import { PlayerEntity } from '../entities/player.entity';
import { PlayerMapper } from '../mappers/player.mapper';

@Injectable()
export class TypeOrmPlayerRepository extends PlayerRepository {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>
  ) {
    super();
  }

  async create(payload: CreatePlayerPayload): Promise<Player> {
    const entity = this.playerRepository.create({
      roomId: payload.roomId,
      nickname: payload.nickname,
      score: 0,
    });
    const saved = await this.playerRepository.save(entity);
    return PlayerMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Player | null> {
    const entity = await this.playerRepository.findOne({ where: { id } });
    return entity ? PlayerMapper.toDomain(entity) : null;
  }

  async findByRoom(roomId: string): Promise<Player[]> {
    const entities = await this.playerRepository.find({ where: { roomId }, order: { createdAt: 'ASC' } });
    return entities.map(PlayerMapper.toDomain);
  }
}
