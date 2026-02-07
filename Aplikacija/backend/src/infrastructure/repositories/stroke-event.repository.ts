import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StrokeEvent } from '../../domain/models';
import { StrokeEventEntity } from '../database/entities';
import { StrokeEventMapper } from '../mappers';

@Injectable()
export class StrokeEventRepository {
  constructor(
    @InjectRepository(StrokeEventEntity)
    private readonly strokeEventRepo: Repository<StrokeEventEntity>,
    private readonly mapper: StrokeEventMapper
  ) {}

  async findById(eventId: string): Promise<StrokeEvent | null> {
    const entity = await this.strokeEventRepo.findOne({ where: { eventId } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByRoundId(roundId: string): Promise<StrokeEvent[]> {
    const entities = await this.strokeEventRepo.find({
      where: { roundId },
      order: { seq: 'ASC' }
    });
    return this.mapper.toDomainList(entities);
  }
}
