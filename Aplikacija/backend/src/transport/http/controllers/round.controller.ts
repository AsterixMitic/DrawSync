import { Controller, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { RoundClientApi } from '../../../application/client-api/round.client-api';
import { StartRoundDto } from '../dtos/start-round.dto';
import { mapErrorCodeToStatus } from '../utils/error-mapper';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('rooms/:roomId/rounds')
export class RoundController {
  constructor(private readonly roundClientApi: RoundClientApi) {}

  @Post('start')
  async startRound(
    @Param('roomId') roomId: string,
    @CurrentUser() userId: string,
    @Body() dto: StartRoundDto,
    @Res() res: Response
  ) {
    const result = await this.roundClientApi.startRound({
      roomId,
      word: dto.word,
      userId,
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

  @Post('complete')
  async completeRound(
    @Param('roomId') roomId: string,
    @CurrentUser() userId: string,
    @Res() res: Response
  ) {
    const result = await this.roundClientApi.completeRound({ roomId, userId });

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
