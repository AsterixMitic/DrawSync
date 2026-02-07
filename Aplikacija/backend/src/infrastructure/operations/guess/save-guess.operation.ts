import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guess } from '../../../domain/models';
import { GuessEntity } from '../../database/entities';
import { GuessMapper } from '../../mappers';

export interface SaveGuessInput {
  guess: Guess;
}

@Injectable()
export class SaveGuessOperation {
  constructor(
    @InjectRepository(GuessEntity)
    private readonly guessRepo: Repository<GuessEntity>,
    private readonly mapper: GuessMapper
  ) {}

  async execute(input: SaveGuessInput): Promise<void> {
    const entity = this.mapper.toEntity(input.guess);
    await this.guessRepo.save(entity);
  }
}
