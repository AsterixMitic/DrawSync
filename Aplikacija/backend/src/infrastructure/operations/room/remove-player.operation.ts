import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from '../../database/entities';

export interface RemovePlayerInput {
  playerId: string;
}

@Injectable()
export class RemovePlayerOperation {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>
  ) {}

  async execute(input: RemovePlayerInput): Promise<void> {
    await this.playerRepo.delete({ playerId: input.playerId });
  }
}
