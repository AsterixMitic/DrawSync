import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUpdatePlayerScoreOperationPort } from '../../../domain/ports';
import { PlayerEntity } from '../../database/entities';

export interface UpdatePlayerScoreInput {
  playerId: string;
  points: number;
}

@Injectable()
export class UpdatePlayerScoreOperation implements IUpdatePlayerScoreOperationPort {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>
  ) {}

  async execute(input: UpdatePlayerScoreInput): Promise<void> {
    await this.playerRepo.increment({ playerId: input.playerId }, 'score', input.points);
  }
}
