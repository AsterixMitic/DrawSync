import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stroke } from '../../domain/models';
import { IStrokeRepositoryPort } from '../../domain/ports';
import { StrokeEntity } from '../database/entities';
import { StrokeMapper } from '../mappers';

@Injectable()
export class StrokeRepository implements IStrokeRepositoryPort {
  constructor(
    @InjectRepository(StrokeEntity)
    private readonly strokeRepo: Repository<StrokeEntity>,
    private readonly mapper: StrokeMapper
  ) {}

  async findById(id: string): Promise<Stroke | null> {
    const entity = await this.strokeRepo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByRoundId(roundId: string): Promise<Stroke[]> {
    const entities = await this.strokeRepo.find({ where: { roundId } });
    return this.mapper.toDomainList(entities);
  }
}
