import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../results/base.result';
import { RoomStatus } from '../../enums';
import { CompleteRoundResult, CompleteRoundResultData } from '../../results';
import { RoundCompletedEvent } from '../../events';
import type {
  IRoomRepositoryPort,
  ISharedStatePort,
  ISaveRoomOperationPort,
  IUpdateRoundStatusOperationPort,
  ISavePlayerOperationPort
} from '../../ports';

export interface CompleteRoundInput {
  roomId: string;
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
    @Inject('IUpdateRoundStatusOperationPort')
    private readonly updateRoundStatusOp: IUpdateRoundStatusOperationPort,
    @Inject('ISavePlayerOperationPort')
    private readonly savePlayerOp: ISavePlayerOperationPort
  ) {}

  async execute(input: CompleteRoundInput): Promise<CompleteRoundResult> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }

    const room = await this.roomRepo.findByIdFull(input.roomId);
    if (!room) {
      return Result.fail('Room not found', 'NOT_FOUND');
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

    const events = [
      new RoundCompletedEvent(room.id, activeRound.id, activeRound.roundNo, isGameFinished)
    ];

    try {
      await this.updateRoundStatusOp.execute({
        roundId: activeRound.id,
        status: activeRound.status
      });
      await this.saveRoomOp.execute({ room });
      if (isGameFinished) {
        for (const player of room.players) {
          await this.savePlayerOp.execute({ player });
        }
      }
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
      events
    });
  }
}
