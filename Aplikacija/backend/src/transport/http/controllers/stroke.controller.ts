import { Controller, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { StrokeClientApi } from '../../../application/client-api/stroke.client-api';
import { ApplyStrokeDto } from '../dtos/apply-stroke.dto';
import { StrokeActionDto } from '../dtos/stroke-action.dto';
import { mapErrorCodeToStatus } from '../utils/error-mapper';

@Controller('rooms/:roomId/strokes')
export class StrokeController {
  constructor(private readonly strokeClientApi: StrokeClientApi) {}

  @Post()
  async applyStroke(
    @Param('roomId') roomId: string,
    @Body() dto: ApplyStrokeDto,
    @Res() res: Response
  ) {
    const result = await this.strokeClientApi.applyStroke({
      roomId,
      playerId: dto.playerId,
      points: dto.points,
      style: dto.style
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

  @Post('undo')
  async undoStroke(
    @Param('roomId') roomId: string,
    @Body() dto: StrokeActionDto,
    @Res() res: Response
  ) {
    const result = await this.strokeClientApi.undoStroke({
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

  @Post('clear')
  async clearCanvas(
    @Param('roomId') roomId: string,
    @Body() dto: StrokeActionDto,
    @Res() res: Response
  ) {
    const result = await this.strokeClientApi.clearCanvas({
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
}
