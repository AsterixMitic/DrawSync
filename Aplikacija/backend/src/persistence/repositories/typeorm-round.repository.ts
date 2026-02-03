import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from '../../domain/models/round.model';
import { RoundStatus } from '../../domain/models/statuses';
import { CreateRoundPayload, RoundRepository } from '../../domain/repositories/round.repository';
import { RoundEntity } from '../entities/round.entity';
import { RoundMapper } from '../mappers/round.mapper';

@Injectable()
export class TypeOrmRoundRepository extends RoundRepository {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepository: Repository<RoundEntity>
  ) {
    super();
  }

  async create(payload: CreateRoundPayload): Promise<Round> {
    const entity = this.roundRepository.create({
      roomId: payload.roomId,
      roundNumber: payload.roundNumber,
      word: payload.word ?? null,
      status: RoundStatus.Pending,
      durationSeconds: payload.durationSeconds ?? null,
      startedAt: null,
      endedAt: null,
    });
    const saved = await this.roundRepository.save(entity);
    return RoundMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Round | null> {
    const entity = await this.roundRepository.findOne({ where: { id } });
    return entity ? RoundMapper.toDomain(entity) : null;
  }
}
