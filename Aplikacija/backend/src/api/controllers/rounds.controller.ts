import { Controller, Get, Param } from '@nestjs/common';
import { RoundService } from '../../application/services/round.service';
import { Round } from '../../domain/models/round.model';
import { RoundDto } from '../dto/round.dto';

@Controller('rounds')
export class RoundsController {
  constructor(private readonly roundService: RoundService) {}

  @Get(':roundId')
  async getRound(@Param('roundId') roundId: string): Promise<RoundDto> {
    const round = await this.roundService.getRound(roundId);
    return this.toRoundDto(round);
  }

  private toRoundDto(round: Round): RoundDto {
    return {
      id: round.id,
      roomId: round.roomId,
      roundNumber: round.roundNumber,
      word: round.word,
      status: round.status,
      durationSeconds: round.durationSeconds,
      startedAt: round.startedAt,
      endedAt: round.endedAt,
      createdAt: round.createdAt,
      updatedAt: round.updatedAt,
    };
  }
}
