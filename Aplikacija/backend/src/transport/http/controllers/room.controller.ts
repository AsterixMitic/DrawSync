import { Controller, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { RoomClientApi } from '../../../application/client-api/room.client-api';
import { CreateRoomDto } from '../dtos/create-room.dto';
import { LeaveRoomDto } from '../dtos/leave-room.dto';
import { StartGameDto } from '../dtos/start-game.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { mapErrorCodeToStatus } from '../utils/error-mapper';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomClientApi: RoomClientApi) {}

  @Post()
  async createRoom(
    @Body() dto: CreateRoomDto,
    @CurrentUser() userId: string,
    @Res() res: Response
  ) {
    const result = await this.roomClientApi.createRoom({
      userId,
      roundCount: dto.roundCount,
      playerMaxCount: dto.playerMaxCount
    });

    if (result.isFailure()) {
      return res.status(mapErrorCodeToStatus(result.errorCode)).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
    }

    return res.status(HttpStatus.CREATED).json({
      success: true,
      data: result.data
    });
  }

  @Post(':roomId/join')
  async joinRoom(
    @Param('roomId') roomId: string,
    @CurrentUser() userId: string,
    @Res() res: Response
  ) {
    const result = await this.roomClientApi.joinRoom({
      roomId,
      userId
    });

    if (result.isFailure()) {
      return res.status(mapErrorCodeToStatus(result.errorCode)).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result.data
    });
  }

  @Post(':roomId/leave')
  async leaveRoom(
    @Param('roomId') roomId: string,
    @Body() dto: LeaveRoomDto,
    @Res() res: Response
  ) {
    const result = await this.roomClientApi.leaveRoom({
      roomId,
      playerId: dto.playerId
    });

    if (result.isFailure()) {
      return res.status(mapErrorCodeToStatus(result.errorCode)).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result.data
    });
  }

  @Post(':roomId/start')
  async startGame(
    @Param('roomId') roomId: string,
    @Body() dto: StartGameDto,
    @Res() res: Response
  ) {
    const result = await this.roomClientApi.startGame({
      roomId,
      words: dto.words
    });

    if (result.isFailure()) {
      return res.status(mapErrorCodeToStatus(result.errorCode)).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
    }

    return res.status(HttpStatus.OK).json({
      success: true,
      data: result.data
    });
  }
}
