import { DomainError } from './domain-error';

export class NotAuthorizedError extends DomainError {
  constructor(action: string, reason: string) {
    super(
      `Not authorized to ${action}: ${reason}`,
      'NOT_AUTHORIZED'
    );
  }
}