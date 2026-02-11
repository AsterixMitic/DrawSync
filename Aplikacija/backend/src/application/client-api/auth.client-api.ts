import { Inject, Injectable } from '@nestjs/common';
import { AuthDomainApi } from '../../domain/api';
import { RegisterResult, LoginResult, LoginResultData } from '../../domain/results';
import { Result } from '../../domain/results/base.result';
import type { IEventPublisherPort, ITokenProviderPort } from '../../domain/ports';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable()
export class AuthClientApi {
  constructor(
    private readonly authDomainApi: AuthDomainApi,
    @Inject('ITokenProviderPort')
    private readonly tokenProvider: ITokenProviderPort,
    @Inject('IEventPublisherPort')
    private readonly eventPublisher: IEventPublisherPort
  ) {}

  async register(request: RegisterRequest): Promise<RegisterResult> {
    const result = await this.authDomainApi.register({
      name: request.name,
      email: request.email,
      password: request.password
    });

    if (result.isSuccess() && result.data?.events?.length) {
      await this.eventPublisher.publishMany(result.data.events);
    }

    return result;
  }

  async login(request: LoginRequest): Promise<LoginResult> {
    const result = await this.authDomainApi.login({
      email: request.email,
      password: request.password
    });

    if (result.isSuccess() && result.data) {
      const token = this.tokenProvider.sign({
        userId: result.data.user.id,
        email: result.data.user.email
      });
      return Result.ok<LoginResultData>({
        user: result.data.user,
        accessToken: token
      });
    }

    return result;
  }
}
