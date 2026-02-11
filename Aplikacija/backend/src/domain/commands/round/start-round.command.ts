import { Inject, Injectable } from '@nestjs/common';
import { RoomStatus } from '../../enums';
import { RoundStartedEvent } from '../../events';
import { Result } from '../../results/base.result';
import { StartRoundResult, StartRoundResultData } from '../../results';
import type {
  IRoomRepositoryPort,
  IRoundRepositoryPort,
  ISharedStatePort,
  ISaveRoomOperationPort,
  ISaveRoundOperationPort,
  ISavePlayerOperationPort
} from '../../ports';

export interface StartRoundInput {
  roomId: string;
  word: string;
}

@Injectable()
export class StartRoundCommand {
  constructor(
    @Inject('IRoomRepositoryPort')
    private readonly roomRepo: IRoomRepositoryPort,
    @Inject('IRoundRepositoryPort')
    private readonly roundRepo: IRoundRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
    @Inject('ISaveRoomOperationPort')
    private readonly saveRoomOp: ISaveRoomOperationPort,
    @Inject('ISaveRoundOperationPort')
    private readonly saveRoundOp: ISaveRoundOperationPort,
    @Inject('ISavePlayerOperationPort')
    private readonly savePlayerOp: ISavePlayerOperationPort
  ) {}

  async execute(input: StartRoundInput): Promise<StartRoundResult> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }
    if (!input.word || input.word.trim().length < 2) {
      return Result.fail('Word is required', 'VALIDATION_ERROR');
    }

    const room = await this.roomRepo.findByIdFull(input.roomId);
    if (!room) {
      return Result.fail('Room not found', 'NOT_FOUND');
    }

    if (room.status === RoomStatus.FINISHED) {
      return Result.fail('Cannot start round in a finished room', 'INVALID_STATE');
    }
    if (room.status === RoomStatus.WAITING) {
      return Result.fail('Game has not started', 'INVALID_STATE');
    }

    const activeRound = await this.roundRepo.findActiveByRoomId(room.id);
    if (activeRound) {
      return Result.fail('Another round is already active', 'INVALID_STATE');
    }

    let round;
    try {
      round = room.createNextRound();
      round.setWord(input.word);
      round.start();
    } catch (error: any) {
      return Result.fail(error?.message ?? 'Failed to start round', 'DOMAIN_ERROR');
    }

    const drawerId = round.currentDrawerId;
    if (!drawerId) {
      return Result.fail('Drawer is not set for this round', 'DOMAIN_ERROR');
    }

    const events = [
      new RoundStartedEvent(room.id, round.id, round.roundNo, drawerId, round.word)
    ];

    try {
      // Save round BEFORE room (circular FK: rooms.current_round_id -> rounds.id)
      await this.saveRoundOp.execute({ round });
      await this.saveRoomOp.execute({ room });
      for (const player of room.players) {
        await this.savePlayerOp.execute({ player });
      }
      await this.sharedState.setRoomState({
        roomId: room.id,
        status: room.status,
        lockOwnerId: drawerId,
        currentRoundId: round.id,
        activePlayerIds: room.players.map((p) => p.playerId),
        roundStatus: round.status
      });
    } catch (error: any) {
      return Result.fail(`Failed to persist round: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<StartRoundResultData>({
      round,
      drawerId,
      playerStates: room.players.map((p) => ({ playerId: p.playerId, state: p.state })),
      events
    });
  }
}
