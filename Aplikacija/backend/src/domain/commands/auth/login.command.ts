import { Inject, Injectable } from '@nestjs/common';
import { LoginResult } from '../../results';
import { Result } from '../../results/base.result';
import type { IUserRepositoryPort, IPasswordHasherPort } from '../../ports';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginCommand {
  constructor(
    @Inject('IUserRepositoryPort')
    private readonly userRepo: IUserRepositoryPort,
    @Inject('IPasswordHasherPort')
    private readonly passwordHasher: IPasswordHasherPort
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    if (!input.email || !input.password) {
      return Result.fail('Email and password are required', 'VALIDATION_ERROR');
    }

    const user = await this.userRepo.findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      return Result.fail('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordValid = await this.passwordHasher.compare(input.password, user.password);
    if (!passwordValid) {
      return Result.fail('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    return Result.ok({ user, accessToken: '' });
  }
}
