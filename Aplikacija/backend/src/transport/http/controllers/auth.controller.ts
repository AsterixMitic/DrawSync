import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AuthClientApi } from '../../../application/client-api/auth.client-api';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { Public } from '../decorators/public.decorator';
import { mapErrorCodeToStatus } from '../utils/error-mapper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClientApi: AuthClientApi) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.authClientApi.register({
      name: dto.name,
      email: dto.email,
      password: dto.password
    });

    if (result.isFailure()) {
      return res.status(mapErrorCodeToStatus(result.errorCode)).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
    }

    const user = result.data!.user;
    return res.status(HttpStatus.CREATED).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          imgPath: user.imgPath,
          totalScore: user.totalScore
        }
      }
    });
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authClientApi.login({
      email: dto.email,
      password: dto.password
    });

    if (result.isFailure()) {
      return res.status(mapErrorCodeToStatus(result.errorCode)).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
    }

    const { user, accessToken } = result.data!;
    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          imgPath: user.imgPath,
          totalScore: user.totalScore
        }
      }
    });
  }
}
