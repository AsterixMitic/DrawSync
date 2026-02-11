import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoundStatus } from '../../../domain/enums';
import { IUpdateRoundStatusOperationPort } from '../../../domain/ports';
import { RoundEntity } from '../../database/entities';

export interface UpdateRoundStatusInput {
  roundId: string;
  status: RoundStatus;
}

@Injectable()
export class UpdateRoundStatusOperation implements IUpdateRoundStatusOperationPort {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepo: Repository<RoundEntity>
  ) {}

  async execute(input: UpdateRoundStatusInput): Promise<void> {
    await this.roundRepo.update({ id: input.roundId }, { roundStatus: input.status });
  }
}
