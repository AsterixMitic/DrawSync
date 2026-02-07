import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from '../../../domain/models';
import { RoundEntity } from '../../database/entities';
import { RoundMapper } from '../../mappers';

export interface SaveRoundInput {
  round: Round;
}

@Injectable()
export class SaveRoundOperation {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepo: Repository<RoundEntity>,
    private readonly mapper: RoundMapper
  ) {}

  async execute(input: SaveRoundInput): Promise<void> {
    const entity = this.mapper.toEntity(input.round);
    await this.roundRepo.save(entity);
  }
}
