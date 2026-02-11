import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../../domain/models';
import { IPlayerRepositoryPort } from '../../domain/ports';
import { PlayerEntity, GuessEntity } from '../database/entities';
import { PlayerMapper } from '../mappers';

@Injectable()
export class PlayerRepository implements IPlayerRepositoryPort {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
    @InjectRepository(GuessEntity)
    private readonly guessRepo: Repository<GuessEntity>,
    private readonly mapper: PlayerMapper
  ) {}

  async findById(id: string): Promise<Player | null> {
    const entity = await this.playerRepo.findOne({ where: { playerId: id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdWithUser(id: string): Promise<Player | null> {
    const entity = await this.playerRepo.findOne({
      where: { playerId: id },
      relations: { user: true }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByRoomId(roomId: string): Promise<Player[]> {
    const entities = await this.playerRepo.find({ where: { roomId } });
    return this.mapper.toDomainList(entities);
  }

  async findByRoomAndUser(roomId: string, userId: string): Promise<Player | null> {
    const entity = await this.playerRepo.findOne({ where: { roomId, userId } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async hasPlayerGuessedCorrectly(roundId: string, playerId: string): Promise<boolean> {
    return this.guessRepo.exist({
      where: {
        roundId,
        playerId,
        rightGuess: true
      }
    });
  }
}
