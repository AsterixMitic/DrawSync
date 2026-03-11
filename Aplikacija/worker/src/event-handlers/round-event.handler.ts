import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from '../database/entities/player.entity.js';
import { UserEntity } from '../database/entities/user.entity.js';

@Injectable()
export class RoundEventHandler {
  private readonly logger = new Logger(RoundEventHandler.name);

  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async handleRoundStarted(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Round ${payload.roundNo} started in room ${payload.roomId} - drawer: ${payload.drawerId}`,
    );
  }

  async handleRoundCompleted(payload: Record<string, any>): Promise<void> {
    const { roundId, roundNo, roomId, drawerPoints, drawerId, isGameFinished } = payload;

    if (drawerPoints > 0 && drawerId) {
      await this.playerRepo.increment({ playerId: drawerId }, 'score', drawerPoints);

      const player = await this.playerRepo.findOne({
        where: { playerId: drawerId },
        relations: ['user'],
      });

      if (player?.user) {
        await this.userRepo.increment({ id: player.user.id }, 'totalScore', drawerPoints);
      }

      this.logger.log(`Drawer ${drawerId} awarded ${drawerPoints} pts for round ${roundNo}`);
    }

    this.logger.log(
      `Round ${roundNo} completed in room ${roomId} - game finished: ${isGameFinished}`,
    );
  }
}
