import { Injectable } from '@nestjs/common';
import { RegisterCommand, RegisterInput } from '../commands/auth/register.command';
import { LoginCommand, LoginInput } from '../commands/auth/login.command';
import { RegisterResult, LoginResult } from '../results';

@Injectable()
export class AuthDomainApi {
  constructor(
    private readonly registerCommand: RegisterCommand,
    private readonly loginCommand: LoginCommand
  ) {}

  async register(input: RegisterInput): Promise<RegisterResult> {
    return this.registerCommand.execute(input);
  }

  async login(input: LoginInput): Promise<LoginResult> {
    return this.loginCommand.execute(input);
  }
}
