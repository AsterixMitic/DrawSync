import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Round } from '../../domain/models/round.model';
import { RoomRepository } from '../../domain/repositories/room.repository';
import { CreateRoundPayload, RoundRepository } from '../../domain/repositories/round.repository';

@Injectable()
export class RoundService {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly roundRepository: RoundRepository
  ) {}

  async createRound(roomId: string, payload: { roundNumber: number; word?: string | null; durationSeconds?: number | null }): Promise<Round> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('Soba nije pronađena.');
    }

    if (!Number.isFinite(payload.roundNumber) || payload.roundNumber <= 0) {
      throw new BadRequestException('Redni broj runde mora biti pozitivan broj.');
    }

    const createPayload: CreateRoundPayload = {
      roomId,
      roundNumber: payload.roundNumber,
      word: payload.word ?? null,
      durationSeconds: payload.durationSeconds ?? null,
    };
    return this.roundRepository.create(createPayload);
  }

  async getRound(id: string): Promise<Round> {
    const round = await this.roundRepository.findById(id);
    if (!round) {
      throw new NotFoundException('Runda nije pronađena.');
    }
    return round;
  }
}
