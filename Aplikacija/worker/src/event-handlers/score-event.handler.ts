import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from '../database/entities/player.entity.js';
import { UserEntity } from '../database/entities/user.entity.js';

@Injectable()
export class ScoreEventHandler {
  private readonly logger = new Logger(ScoreEventHandler.name);

  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async handleCorrectGuess(payload: Record<string, any>): Promise<void> {
    const { playerId, pointsAwarded } = payload;

    if (!pointsAwarded || pointsAwarded <= 0) return;

    await this.playerRepo.increment({ playerId }, 'score', pointsAwarded);

    const player = await this.playerRepo.findOne({
      where: { playerId },
      relations: ['user'],
    });

    if (player?.user) {
      await this.userRepo.increment({ id: player.user.id }, 'totalScore', pointsAwarded);
    }

    this.logger.log(`Score +${pointsAwarded} applied to player ${playerId}`);
  }
}
