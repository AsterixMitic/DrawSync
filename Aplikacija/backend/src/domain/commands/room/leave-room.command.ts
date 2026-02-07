import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../results/base.result';
import { LeaveRoomResult, LeaveRoomResultData } from '../../results';
import { IRoomRepositoryPort, ISharedStatePort } from '../../ports';
import {
  DrawerChangedEvent,
  PlayerLeftEvent,
  RoomDeletedEvent,
  RoomOwnerChangedEvent
} from '../../events';
import { RemovePlayerOperation } from '../../../infrastructure/operations/room/remove-player.operation';
import { SaveRoomOperation } from '../../../infrastructure/operations/room/save-room.operation';
import { DeleteRoomOperation } from '../../../infrastructure/operations/room/delete-room.operation';
import { SavePlayerOperation } from '../../../infrastructure/operations/room/save-player.operation';

export interface LeaveRoomInput {
  roomId: string;
  playerId: string;
}

@Injectable()
export class LeaveRoomCommand {
  constructor(
    @Inject('IRoomRepositoryPort')
    private readonly roomRepo: IRoomRepositoryPort,
    @Inject('ISharedStatePort')
    private readonly sharedState: ISharedStatePort,
    private readonly removePlayerOp: RemovePlayerOperation,
    private readonly saveRoomOp: SaveRoomOperation,
    private readonly deleteRoomOp: DeleteRoomOperation,
    private readonly savePlayerOp: SavePlayerOperation
  ) {}

  async execute(input: LeaveRoomInput): Promise<LeaveRoomResult> {
    if (!input.roomId || !input.playerId) {
      return Result.fail('Room ID and Player ID are required', 'VALIDATION_ERROR');
    }

    const room = await this.roomRepo.findByIdWithPlayers(input.roomId);
    if (!room) {
      return Result.fail('Room not found', 'NOT_FOUND');
    }

    const player = room.getPlayer(input.playerId);
    if (!player) {
      return Result.fail('Player not found in room', 'NOT_FOUND');
    }

    const wasOwner = room.roomOwnerId === input.playerId;
    const wasDrawer = player.isDrawer();

    const removedPlayer = room.removePlayer(input.playerId);
    if (!removedPlayer) {
      return Result.fail('Failed to remove player', 'DOMAIN_ERROR');
    }

    const events = [
      new PlayerLeftEvent(room.id, input.playerId, room.playerCount, wasOwner)
    ];

    if (room.playerCount === 0) {
      await this.removePlayerOp.execute({ playerId: input.playerId });
      await this.deleteRoomOp.execute({ roomId: room.id });
      await this.sharedState.deleteRoomState(room.id);

      events.push(new RoomDeletedEvent(room.id));

      return Result.ok<LeaveRoomResultData>({
        room: null,
        removedPlayer,
        newOwnerId: null,
        roomDeleted: true,
        events
      });
    }

    if (wasOwner) {
      events.push(new RoomOwnerChangedEvent(room.id, room.roomOwnerId));
    }

    if (wasDrawer && room.isInProgress) {
      const newDrawer = room.currentDrawer;
      if (newDrawer) {
        events.push(new DrawerChangedEvent(room.id, newDrawer.playerId));
      }
    }

    await this.removePlayerOp.execute({ playerId: input.playerId });
    await this.saveRoomOp.execute({ room });
    if (wasDrawer && room.isInProgress) {
      for (const updatedPlayer of room.players) {
        await this.savePlayerOp.execute({ player: updatedPlayer });
      }
    }

    const roomState = await this.sharedState.getRoomState(room.id);
    const newDrawerId = room.isInProgress ? room.currentDrawer?.playerId ?? null : null;
    if (roomState) {
      await this.sharedState.removeActivePlayer(room.id, input.playerId);
      if (wasDrawer) {
        await this.sharedState.updateLockOwner(room.id, newDrawerId);
      }
    } else {
      await this.sharedState.setRoomState({
        roomId: room.id,
        status: room.status,
        lockOwnerId: wasDrawer ? newDrawerId : null,
        currentRoundId: room.currentRoundId ?? null,
        activePlayerIds: room.players.map((p) => p.playerId),
        roundStatus: null
      });
    }

    return Result.ok<LeaveRoomResultData>({
      room,
      removedPlayer,
      newOwnerId: wasOwner ? room.roomOwnerId : null,
      roomDeleted: false,
      events
    });
  }
}
