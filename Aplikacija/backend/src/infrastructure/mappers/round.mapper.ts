import { Injectable } from '@nestjs/common';
import { BaseMapper } from './base.mapper';
import { Round } from '../../domain/models';
import { RoundStatus } from '../../domain/enums';
import { RoundEntity } from '../database/entities';
import { StrokeMapper } from './stroke.mapper';
import { GuessMapper } from './guess.mapper';

@Injectable()
export class RoundMapper extends BaseMapper<Round, RoundEntity> {
  constructor(
    private readonly strokeMapper: StrokeMapper,
    private readonly guessMapper: GuessMapper
  ) {
    super();
  }

  toDomain(entity: RoundEntity): Round {
    // if (!entity) return null;

    const round = new Round({
      id: entity.id,
      roundNo: entity.roundNo,
      roomId: entity.roomId,
      status: entity.roundStatus as RoundStatus,
      word: entity.word,
      startedAt: entity.startedAt,
      currentDrawerId: entity.currentDrawerId
    });

    if (entity.strokes) {
      round.setStrokes(this.strokeMapper.toDomainList(entity.strokes));
    }

    if (entity.guesses) {
      round.setGuesses(this.guessMapper.toDomainList(entity.guesses));
    }

    return round;
  }

  toEntity(domain: Round): RoundEntity {
    // if (!domain) return null;
    const entity = new RoundEntity();
    entity.id = domain.id;
    entity.roundNo = domain.roundNo;
    entity.roomId = domain.roomId;
    entity.roundStatus = domain.status;
    entity.word = domain.word;
    entity.startedAt = domain.startedAt;
    entity.currentDrawerId = domain.currentDrawerId;
    return entity;
  }
}