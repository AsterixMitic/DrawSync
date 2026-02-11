import { Inject, Injectable } from '@nestjs/common';
import { Player, Room } from '../../models';
import { PlayerState, RoomStatus } from '../../enums';
import { JoinRoomResult, JoinRoomResultData } from '../../results';
import { PlayerJoinedEvent } from '../../events';
import { Result } from '../../results/base.result';
import type { IPlayerRepositoryPort, IRoomRepositoryPort, IUserRepositoryPort, ISavePlayerOperationPort } from '../../ports';

export interface JoinRoomInput {
  roomId: string;
  userId: string;
}

@Injectable()
export class JoinRoomCommand {
  constructor(
    @Inject('IRoomRepositoryPort')
    private readonly roomRepo: IRoomRepositoryPort,
    @Inject('IPlayerRepositoryPort')
    private readonly playerRepo: IPlayerRepositoryPort,
    @Inject('IUserRepositoryPort')
    private readonly userRepo: IUserRepositoryPort,
    @Inject('ISavePlayerOperationPort')
    private readonly savePlayerOp: ISavePlayerOperationPort
  ) {}

  async execute(input: JoinRoomInput): Promise<JoinRoomResult> {
    if (!input.roomId) {
      return Result.fail('Room ID is required', 'VALIDATION_ERROR');
    }
    if (!input.userId) {
      return Result.fail('User ID is required', 'VALIDATION_ERROR');
    }

    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      return Result.fail('User not found', 'NOT_FOUND');
    }

    const room = await this.roomRepo.findByIdWithPlayers(input.roomId);
    if (!room) {
      return Result.fail('Room not found', 'NOT_FOUND');
    }

    if (room.status !== RoomStatus.WAITING) {
      return Result.fail('Cannot join room that is not in WAITING status', 'INVALID_STATE');
    }

    if (room.isFull) {
      return Result.fail(`Room is full (max ${room.playerMaxCount} players)`, 'ROOM_FULL');
    }

    const existingPlayer = await this.playerRepo.findByRoomAndUser(input.roomId, input.userId);
    if (existingPlayer) {
      return Result.fail('User is already in this room', 'ALREADY_JOINED');
    }

    const player = new Player({
      userId: input.userId,
      roomId: room.id,
      state: PlayerState.WAITING
    });

    try {
      room.addPlayer(player);
    } catch (error: any) {
      return Result.fail(error?.message ?? 'Failed to add player', 'DOMAIN_ERROR');
    }

    const events = [
      new PlayerJoinedEvent(room.id, player.playerId, player.userId, room.playerCount)
    ];

    try {
      await this.savePlayerOp.execute({ player });
    } catch (error: any) {
      return Result.fail(`Failed to persist player: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<JoinRoomResultData>({
      room,
      player,
      events
    });
  }
}
