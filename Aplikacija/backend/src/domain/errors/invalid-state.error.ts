import { DomainError } from './domain-error';

export class InvalidStateError extends DomainError {
  constructor(entity: string, currentState: string, requiredState: string) {
    super(
      `${entity} is in state '${currentState}', but '${requiredState}' is required`,
      'INVALID_STATE'
    );
  }
}