import { Inject, Injectable } from '@nestjs/common';
import { RoomDomainApi } from '../../domain/api';
import { CreateRoomResult, JoinRoomResult, LeaveRoomResult } from '../../domain/results';
import type { IEventPublisherPort } from '../../domain/ports';
import { StartGameWorkflow, StartGameResultData } from '../workflows/start-game.workflow';
import { Result } from '../../domain/results/base.result';

export interface CreateRoomRequest {
  userId: string;
  roundCount?: number;
  playerMaxCount?: number;
}

export interface JoinRoomRequest {
  roomId: string;
  userId: string;
}

export interface LeaveRoomRequest {
  roomId: string;
  playerId: string;
}

export interface StartGameRequest {
  roomId: string;
  words: string[];
}

@Injectable()
export class RoomClientApi {
  constructor(
    private readonly roomDomainApi: RoomDomainApi,
    private readonly startGameWorkflow: StartGameWorkflow,
    @Inject('IEventPublisherPort')
    private readonly eventPublisher: IEventPublisherPort
  ) {}

  async createRoom(request: CreateRoomRequest): Promise<CreateRoomResult> {
    const result = await this.roomDomainApi.createRoom({
      userId: request.userId,
      roundCount: request.roundCount,
      playerMaxCount: request.playerMaxCount
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }

  async joinRoom(request: JoinRoomRequest): Promise<JoinRoomResult> {
    const result = await this.roomDomainApi.joinRoom({
      roomId: request.roomId,
      userId: request.userId
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }

  async leaveRoom(request: LeaveRoomRequest): Promise<LeaveRoomResult> {
    const result = await this.roomDomainApi.leaveRoom({
      roomId: request.roomId,
      playerId: request.playerId
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }

  async startGame(request: StartGameRequest): Promise<Result<StartGameResultData>> {
    const result = await this.startGameWorkflow.execute({
      roomId: request.roomId,
      words: request.words
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }
}
