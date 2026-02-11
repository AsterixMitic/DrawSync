import { DomainEvent } from './base.event';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super('USER_REGISTERED');
  }

  toPayload(): Record<string, any> {
    return {
      userId: this.userId,
      email: this.email
    };
  }
}
