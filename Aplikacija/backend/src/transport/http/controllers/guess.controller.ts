import { Controller, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { GuessClientApi } from '../../../application/client-api/guess.client-api';
import { SubmitGuessDto } from '../dtos/submit-guess.dto';
import { mapErrorCodeToStatus } from '../utils/error-mapper';

@Controller('rooms/:roomId/guesses')
export class GuessController {
  constructor(private readonly guessClientApi: GuessClientApi) {}

  @Post()
  async submitGuess(
    @Param('roomId') roomId: string,
    @Body() dto: SubmitGuessDto,
    @Res() res: Response
  ) {
    const result = await this.guessClientApi.submitGuess({
      roundId: dto.roundId,
      playerId: dto.playerId,
      guessText: dto.guessText
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
