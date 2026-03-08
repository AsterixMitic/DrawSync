import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../results/base.result';
import { RoomStatus } from '../../enums';
import { ResetRoomResult, ResetRoomResultData } from '../../results/room/reset-room.result';
import type {
  IRoomRepositoryPort,
  IRoundRepositoryPort,
  ISharedStatePort,
  ISaveRoomOperationPort,
  ISavePlayerOperationPort,
} from '../../ports';

export interface ResetRoomInput {
  roomId: string;
  userId: string;
}

@Injectable()
export class ResetRoomCommand {
  constructor(
    @Inject('IRoomRepositoryPort')
    private readonly roomRepo: IRoomRepositoryPort,
    @Inject('IRoundRepositoryPort')
    private readonly roundRepo: IRoundRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
    @Inject('ISaveRoomOperationPort')
    private readonly saveRoomOp: ISaveRoomOperationPort,
    @Inject('ISavePlayerOperationPort')
    private readonly savePlayerOp: ISavePlayerOperationPort,
  ) {}

  async execute(input: ResetRoomInput): Promise<ResetRoomResult> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }

    const room = await this.roomRepo.findByIdWithPlayers(input.roomId);
    if (!room) {
      return Result.fail('Room not found', 'NOT_FOUND');
    }

    if (room.status !== RoomStatus.FINISHED) {
      return Result.fail('Can only reset a finished room', 'INVALID_STATE');
    }

    const callerPlayer = room.players.find(p => p.userId === input.userId);
    if (!callerPlayer || callerPlayer.playerId !== room.roomOwnerId) {
      return Result.fail('Only the room owner can start a new game', 'UNAUTHORIZED');
    }

    try {
      room.reset();
    } catch (error: any) {
      return Result.fail(error?.message ?? 'Failed to reset room', 'DOMAIN_ERROR');
    }

    try {
      await this.roundRepo.deleteByRoomId(room.id);
      await this.saveRoomOp.execute({ room });
      for (const player of room.players) {
        await this.savePlayerOp.execute({ player });
      }
      await this.sharedState.setRoomState({
        roomId: room.id,
        status: room.status,
        lockOwnerId: null,
        currentRoundId: null,
        activePlayerIds: room.players.map(p => p.playerId),
        roundStatus: null,
      });
    } catch (error: any) {
      return Result.fail(`Failed to persist room reset: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<ResetRoomResultData>({ roomId: room.id });
  }
}
