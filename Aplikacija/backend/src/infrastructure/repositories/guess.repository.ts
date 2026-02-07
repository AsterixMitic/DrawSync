import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guess } from '../../domain/models';
import { IGuessRepositoryPort } from '../../domain/ports';
import { GuessEntity } from '../database/entities';
import { GuessMapper } from '../mappers';

@Injectable()
export class GuessRepository implements IGuessRepositoryPort {
  constructor(
    @InjectRepository(GuessEntity)
    private readonly guessRepo: Repository<GuessEntity>,
    private readonly mapper: GuessMapper
  ) {}

  async findById(id: string): Promise<Guess | null> {
    const entity = await this.guessRepo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByRoundId(roundId: string): Promise<Guess[]> {
    const entities = await this.guessRepo.find({ where: { roundId } });
    return this.mapper.toDomainList(entities);
  }

  async findByPlayerId(playerId: string): Promise<Guess[]> {
    const entities = await this.guessRepo.find({ where: { playerId } });
    return this.mapper.toDomainList(entities);
  }
}
