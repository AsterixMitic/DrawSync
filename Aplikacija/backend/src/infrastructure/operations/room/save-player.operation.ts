import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../../../domain/models';
import { ISavePlayerOperationPort } from '../../../domain/ports';
import { PlayerEntity } from '../../database/entities';
import { PlayerMapper } from '../../mappers';

export interface SavePlayerInput {
  player: Player;
}

@Injectable()
export class SavePlayerOperation implements ISavePlayerOperationPort {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
    private readonly mapper: PlayerMapper
  ) {}

  async execute(input: SavePlayerInput): Promise<void> {
    const entity = this.mapper.toEntity(input.player);
    await this.playerRepo.save(entity);
  }
}
