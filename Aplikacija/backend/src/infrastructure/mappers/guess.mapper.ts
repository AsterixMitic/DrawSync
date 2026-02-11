import { Injectable } from '@nestjs/common';
import { BaseMapper } from './base.mapper';
import { Guess } from '../../domain/models';
import { GuessEntity } from '../database/entities';

@Injectable()
export class GuessMapper extends BaseMapper<Guess, GuessEntity> {
  toDomain(entity: GuessEntity): Guess {
    // if (!entity) return null;
    return new Guess({
      id: entity.id,
      roundId: entity.roundId,
      playerId: entity.playerId,
      guessText: entity.guessText,
      time: entity.time,
      isCorrect: entity.rightGuess
    });
  }

  toEntity(domain: Guess): GuessEntity {
    // if (!domain) return null;
    const entity = new GuessEntity();
    entity.id = domain.id;
    entity.roundId = domain.roundId;
    entity.playerId = domain.playerId;
    entity.guessText = domain.guessText;
    entity.time = domain.time;
    entity.rightGuess = domain.isCorrect;
    return entity;
  }
}