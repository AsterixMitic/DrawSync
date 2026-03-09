import { Injectable } from '@nestjs/common';
import { CreateRoomCommand } from '../commands/room/create-room.command';
import { JoinRoomCommand } from '../commands/room/join-room.command';
import { LeaveRoomCommand } from '../commands/room/leave-room.command';
import { StartGameCommand } from '../commands/room/start-game.command';
import { ResetRoomCommand } from '../commands/room/reset-room.command';
import {
  CreateRoomInput,
  JoinRoomInput,
  LeaveRoomInput,
  StartGameInput,
  ResetRoomInput
} from '../commands/room';
import {
  CreateRoomResult,
  JoinRoomResult,
  LeaveRoomResult,
  StartGameResult,
  ResetRoomResult
} from '../results/room';

@Injectable()
export class RoomDomainApi {
  constructor(
    private readonly createRoomCommand: CreateRoomCommand,
    private readonly joinRoomCommand: JoinRoomCommand,
    private readonly leaveRoomCommand: LeaveRoomCommand,
    private readonly startGameCommand: StartGameCommand,
    private readonly resetRoomCommand: ResetRoomCommand
  ) {}

  async createRoom(input: CreateRoomInput): Promise<CreateRoomResult> {
    return this.createRoomCommand.execute(input);
  }

  async joinRoom(input: JoinRoomInput): Promise<JoinRoomResult> {
    return this.joinRoomCommand.execute(input);
  }

  async leaveRoom(input: LeaveRoomInput): Promise<LeaveRoomResult> {
    return this.leaveRoomCommand.execute(input);
  }

  async startGame(input: StartGameInput): Promise<StartGameResult> {
    return this.startGameCommand.execute(input);
  }

  async resetRoom(input: ResetRoomInput): Promise<ResetRoomResult> {
    return this.resetRoomCommand.execute(input);
  }
}
