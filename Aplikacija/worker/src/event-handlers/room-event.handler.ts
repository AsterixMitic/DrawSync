import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RoomEventHandler {
  private readonly logger = new Logger(RoomEventHandler.name);

  async handlePlayerJoined(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Player ${payload.playerId} joined room ${payload.roomId} (total: ${payload.playerCount})`,
    );
  }

  async handlePlayerLeft(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `Player ${payload.playerId} left room ${payload.roomId} (total: ${payload.playerCount})`,
    );
  }
}
