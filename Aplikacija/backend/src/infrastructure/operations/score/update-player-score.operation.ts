import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from '../../database/entities';

export interface UpdatePlayerScoreInput {
  playerId: string;
  points: number;
}

@Injectable()
export class UpdatePlayerScoreOperation {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>
  ) {}

  async execute(input: UpdatePlayerScoreInput): Promise<void> {
    await this.playerRepo.increment({ playerId: input.playerId }, 'score', input.points);
  }
}
