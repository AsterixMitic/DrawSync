import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stroke } from '../../../domain/models';
import { ISaveStrokeOperationPort } from '../../../domain/ports';
import { StrokeEntity } from '../../database/entities';
import { StrokeMapper } from '../../mappers';

export interface SaveStrokeInput {
  stroke: Stroke;
}

@Injectable()
export class SaveStrokeOperation implements ISaveStrokeOperationPort {
  constructor(
    @InjectRepository(StrokeEntity)
    private readonly strokeRepo: Repository<StrokeEntity>,
    private readonly mapper: StrokeMapper
  ) {}

  async execute(input: SaveStrokeInput): Promise<void> {
    const entity = this.mapper.toEntity(input.stroke);
    await this.strokeRepo.save(entity);
  }
}
