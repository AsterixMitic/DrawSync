import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from '../../domain/models';
import { RoundStatus } from '../../domain/enums';
import { IRoundRepositoryPort } from '../../domain/ports';
import { RoundEntity, StrokeEventEntity } from '../database/entities';
import { RoundMapper } from '../mappers';

@Injectable()
export class RoundRepository implements IRoundRepositoryPort {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepo: Repository<RoundEntity>,
    @InjectRepository(StrokeEventEntity)
    private readonly strokeEventRepo: Repository<StrokeEventEntity>,
    private readonly mapper: RoundMapper
  ) {}

  async findById(id: string): Promise<Round | null> {
    const entity = await this.roundRepo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdWithStrokes(id: string): Promise<Round | null> {
    const entity = await this.roundRepo.findOne({
      where: { id },
      relations: { strokes: true }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdWithGuesses(id: string): Promise<Round | null> {
    const entity = await this.roundRepo.findOne({
      where: { id },
      relations: { guesses: true }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findActiveByRoomId(roomId: string): Promise<Round | null> {
    const entity = await this.roundRepo.findOne({
      where: { roomId, roundStatus: RoundStatus.ACTIVE }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByRoomId(roomId: string): Promise<Round[]> {
    const entities = await this.roundRepo.find({ where: { roomId } });
    return this.mapper.toDomainList(entities);
  }

  async getNextSeqForRound(roundId: string): Promise<number> {
    const result = await this.strokeEventRepo
      .createQueryBuilder('se')
      .select('MAX(se.seq)', 'max')
      .where('se.roundId = :roundId', { roundId })
      .getRawOne<{ max: string | null }>();

    const max = result?.max ? Number(result.max) : 0;
    return max + 1;
  }
}
