import { Inject, Injectable } from '@nestjs/common';
import { Room, Player } from '../../models';
import { RoomStatus, PlayerState } from '../../enums';
import { CreateRoomResult, CreateRoomResultData } from '../../results';
import { RoomCreatedEvent, PlayerJoinedEvent } from '../../events';
import { Result } from '../../results/base.result';
import type { IUserRepositoryPort, ISaveRoomOperationPort, ISavePlayerOperationPort } from '../../ports';

export interface CreateRoomInput {
  userId: string;
  roundCount?: number;
  playerMaxCount?: number;
}

@Injectable()
export class CreateRoomCommand {
  constructor(
    @Inject('IUserRepositoryPort')
    private readonly userRepo: IUserRepositoryPort,
    @Inject('ISaveRoomOperationPort')
    private readonly saveRoomOp: ISaveRoomOperationPort,
    @Inject('ISavePlayerOperationPort')
    private readonly savePlayerOp: ISavePlayerOperationPort
  ) {}

  async execute(input: CreateRoomInput): Promise<CreateRoomResult> {
    const validationError = this.validate(input);
    if (validationError) {
      return Result.fail(validationError, 'VALIDATION_ERROR');
    }

    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      return Result.fail('User not found', 'NOT_FOUND');
    }

    const room = new Room({
      status: RoomStatus.WAITING,
      roundCount: input.roundCount ?? 3,
      playerMaxCount: input.playerMaxCount ?? 8
    });

    const player = new Player({
      userId: input.userId,
      roomId: room.id,
      state: PlayerState.WAITING
    });

    room.addPlayer(player);

    const events = [
      new RoomCreatedEvent(
        room.id,
        player.playerId,
        room.roundCount,
        room.playerMaxCount
      ),
      new PlayerJoinedEvent(
        room.id,
        player.playerId,
        player.userId,
        1
      )
    ];

    try {
      // Save room first WITHOUT owner (circular FK: room -> player -> room)
      const savedOwnerId = room.roomOwnerId;
      (room as any)._roomOwnerId = null;
      await this.saveRoomOp.execute({ room });

      // Save the player (now room exists)
      await this.savePlayerOp.execute({ player });

      // Update room with the owner reference
      (room as any)._roomOwnerId = savedOwnerId;
      await this.saveRoomOp.execute({ room });
    } catch (error: any) {
      return Result.fail(`Failed to persist room: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<CreateRoomResultData>({
      room,
      player,
      events
    });
  }

  private validate(input: CreateRoomInput): string | null {
    if (!input.userId || input.userId.trim() === '') {
      return 'User ID is required';
    }
    if (input.roundCount !== undefined && (input.roundCount < 1 || input.roundCount > 10)) {
      return 'Round count must be between 1 and 10';
    }
    if (input.playerMaxCount !== undefined && (input.playerMaxCount < 2 || input.playerMaxCount > 16)) {
      return 'Player max count must be between 2 and 16';
    }
    return null;
  }
}
