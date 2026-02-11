import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StrokeEvent } from '../../../domain/models';
import { ISaveStrokeEventOperationPort } from '../../../domain/ports';
import { StrokeEventEntity } from '../../database/entities';
import { StrokeEventMapper } from '../../mappers';

export interface SaveStrokeEventInput {
  strokeEvent: StrokeEvent;
}

@Injectable()
export class SaveStrokeEventOperation implements ISaveStrokeEventOperationPort {
  constructor(
    @InjectRepository(StrokeEventEntity)
    private readonly strokeEventRepo: Repository<StrokeEventEntity>,
    private readonly mapper: StrokeEventMapper
  ) {}

  async execute(input: SaveStrokeEventInput): Promise<void> {
    const entity = this.mapper.toEntity(input.strokeEvent);
    await this.strokeEventRepo.save(entity);
  }
}
