import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../models';
import { RegisterResult, RegisterResultData } from '../../results';
import { UserRegisteredEvent } from '../../events';
import { Result } from '../../results/base.result';
import type { IUserRepositoryPort, IPasswordHasherPort, ISaveUserOperationPort } from '../../ports';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class RegisterCommand {
  constructor(
    @Inject('IUserRepositoryPort')
    private readonly userRepo: IUserRepositoryPort,
    @Inject('IPasswordHasherPort')
    private readonly passwordHasher: IPasswordHasherPort,
    @Inject('ISaveUserOperationPort')
    private readonly saveUserOp: ISaveUserOperationPort
  ) {}

  async execute(input: RegisterInput): Promise<RegisterResult> {
    const validationError = this.validate(input);
    if (validationError) {
      return Result.fail(validationError, 'VALIDATION_ERROR');
    }

    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      return Result.fail('Email is already registered', 'EMAIL_TAKEN');
    }

    const hashedPassword = await this.passwordHasher.hash(input.password);

    const user = new User({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: hashedPassword
    });

    const events = [
      new UserRegisteredEvent(user.id, user.email)
    ];

    try {
      await this.saveUserOp.execute({ user });
    } catch (error: any) {
      return Result.fail(`Failed to persist user: ${error?.message ?? error}`, 'PERSISTENCE_ERROR');
    }

    return Result.ok<RegisterResultData>({
      user,
      events
    });
  }

  private validate(input: RegisterInput): string | null {
    if (!input.name || input.name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (!input.email || !input.email.includes('@')) {
      return 'Valid email is required';
    }
    if (!input.password || input.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }
}
