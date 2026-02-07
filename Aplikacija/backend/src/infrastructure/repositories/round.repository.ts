import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from '../../domain/models';
import { RoundStatus, StrokeType } from '../../domain/enums';
import { IRoundRepositoryPort } from '../../domain/ports';
import { RoundEntity, StrokeEventEntity } from '../database/entities';
import { RoundMapper } from '../mappers';

@Injectable()
export class RoundRepository implements IRoundRepositoryPort {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepo: Repository<RoundEntity>,
    @InjectRepository(StrokeEventEntity)
    private readonly strokeEventRepo: Repository<StrokeEventEntity>,
    private readonly mapper: RoundMapper
  ) {}

  async findById(id: string): Promise<Round | null> {
    const entity = await this.roundRepo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdWithStrokes(id: string): Promise<Round | null> {
    const entity = await this.roundRepo.findOne({
      where: { id },
      relations: { strokes: true }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdWithGuesses(id: string): Promise<Round | null> {
    const entity = await this.roundRepo.findOne({
      where: { id },
      relations: { guesses: true }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findActiveByRoomId(roomId: string): Promise<Round | null> {
    const entity = await this.roundRepo.findOne({
      where: { roomId, roundStatus: RoundStatus.ACTIVE }
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByRoomId(roomId: string): Promise<Round[]> {
    const entities = await this.roundRepo.find({ where: { roomId } });
    return this.mapper.toDomainList(entities);
  }

  async getNextSeqForRound(roundId: string): Promise<number> {
    const result = await this.strokeEventRepo
      .createQueryBuilder('se')
      .select('MAX(se.seq)', 'max')
      .where('se.roundId = :roundId', { roundId })
      .getRawOne<{ max: string | null }>();

    const max = result?.max ? Number(result.max) : 0;
    return max + 1;
  }

  async getUndoTargetStrokeId(roundId: string): Promise<string | null> {
    const events = await this.strokeEventRepo.find({
      where: { roundId },
      order: { seq: 'ASC' }
    });

    const stack: string[] = [];
    for (const event of events) {
      switch (event.strokeType) {
        case StrokeType.DRAW:
          if (event.strokeId) {
            stack.push(event.strokeId);
          }
          break;
        case StrokeType.UNDO:
          if (stack.length > 0) {
            stack.pop();
          }
          break;
        case StrokeType.CLEAR:
          stack.length = 0;
          break;
        default:
          break;
      }
    }

    return stack.length > 0 ? stack[stack.length - 1] : null;
  }
}
