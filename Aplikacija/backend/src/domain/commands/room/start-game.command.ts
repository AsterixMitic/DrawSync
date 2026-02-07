import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../results/base.result';
import { StartGameResult, StartGameResultData } from '../../results';
import type { IRoomRepositoryPort, ISharedStatePort } from '../../ports';
import { SaveRoomOperation } from '../../../infrastructure/operations/room/save-room.operation';

export interface StartGameInput {
  roomId: string;
}

@Injectable()
export class StartGameCommand {
  constructor(
    @Inject('IRoomRepositoryPort')
    private readonly roomRepo: IRoomRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
    private readonly saveRoomOp: SaveRoomOperation
  ) {}

  async execute(input: StartGameInput): Promise<StartGameResult> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }

    const room = await this.roomRepo.findByIdWithPlayers(input.roomId);
    if (!room) {
      return Result.fail('Room not found', 'NOT_FOUND');
    }

    try {
      room.beginGame();
    } catch (error: any) {
      return Result.fail(error?.message ?? 'Failed to start game', 'DOMAIN_ERROR');
    }

    try {
      await this.saveRoomOp.execute({ room });
      await this.sharedState.setRoomState({
        roomId: room.id,
        status: room.status,
        lockOwnerId: null,
        currentRoundId: room.currentRoundId ?? null,
        activePlayerIds: room.players.map((p) => p.playerId),
        roundStatus: null
      });
    } catch (error: any) {
      return Result.fail(`Failed to persist room: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<StartGameResultData>({
      room,
      events: []
    });
  }
}
