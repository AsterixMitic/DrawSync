import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../results/base.result';
import { RoomStatus } from '../../enums';
import { CompleteRoundResult, CompleteRoundResultData } from '../../results';
import { RoundCompletedEvent } from '../../events';
import type {
  IRoomRepositoryPort,
  ISharedStatePort,
  ISaveRoomOperationPort,
  ISavePlayerOperationPort,
  IUpdateRoundStatusOperationPort,
} from '../../ports';

export interface CompleteRoundInput {
  roomId: string;
  userId?: string;
  skipOwnerCheck?: boolean;
}

@Injectable()
export class CompleteRoundCommand {
  constructor(
    @Inject('IRoomRepositoryPort')
    private readonly roomRepo: IRoomRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
    @Inject('ISaveRoomOperationPort')
    private readonly saveRoomOp: ISaveRoomOperationPort,
    @Inject('ISavePlayerOperationPort')
    private readonly savePlayerOp: ISavePlayerOperationPort,
    @Inject('IUpdateRoundStatusOperationPort')
    private readonly updateRoundStatusOp: IUpdateRoundStatusOperationPort,
  ) {}

  async execute(input: CompleteRoundInput): Promise<CompleteRoundResult> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }

    const room = await this.roomRepo.findByIdFull(input.roomId);
    if (!room) {
      return Result.fail('Room not found', 'NOT_FOUND');
    }

    if (!input.skipOwnerCheck) {
      const callerPlayer = room.players.find(p => p.userId === input.userId);
      if (!callerPlayer || callerPlayer.playerId !== room.roomOwnerId) {
        return Result.fail('Only the room owner can complete a round', 'UNAUTHORIZED');
      }
    }

    const activeRound = room.currentRound ?? room.rounds.find((r) => r.isActive) ?? null;
    if (!activeRound) {
      return Result.fail('No active round found', 'INVALID_STATE');
    }

    if (!room.currentRoundId) {
      room.setCurrentRoundId(activeRound.id);
    }

    try {
      room.completeCurrentRound();
    } catch (error: any) {
      return Result.fail(error?.message ?? 'Failed to complete round', 'DOMAIN_ERROR');
    }

    const isGameFinished = room.status === RoomStatus.FINISHED;

    // Compute drawer points from Redis (async guesses not yet in DB)
    const correctGuessCount = await this.sharedState.getCorrectGuesserCount(input.roomId);
    const drawerPoints = Math.min(correctGuessCount * 30, 90);
    const drawer = room.players.find(p => p.playerId === activeRound.currentDrawerId) ?? null;

    const events = [
      new RoundCompletedEvent(
        room.id,
        activeRound.id,
        activeRound.roundNo,
        isGameFinished,
        drawerPoints,
        drawer?.playerId ?? null
      )
    ];

    try {
      await this.updateRoundStatusOp.execute({ roundId: activeRound.id, status: activeRound.status });
      await this.saveRoomOp.execute({ room });

      if (isGameFinished) {
        for (const player of room.players) {
          await this.savePlayerOp.execute({ player });
        }
      }

      await this.sharedState.clearStrokeIds(input.roomId);
      await this.sharedState.clearCorrectGuessers(input.roomId);
      await this.sharedState.setRoomState({
        roomId: room.id,
        status: room.status,
        lockOwnerId: null,
        currentRoundId: activeRound.id,
        activePlayerIds: room.players.map((p) => p.playerId),
        roundStatus: activeRound.status
      });
    } catch (error: any) {
      return Result.fail(`Failed to persist round completion: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<CompleteRoundResultData>({
      round: activeRound,
      roomStatus: room.status,
      nextDrawerId: room.nextDrawer?.playerId ?? null,
      drawerPoints,
      drawerId: drawer?.playerId ?? null,
      events
    });
  }
}
