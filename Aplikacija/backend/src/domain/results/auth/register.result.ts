import { DomainEvent } from '../../events/base.event';
import { User } from '../../models';
import { Result } from '../base.result';

export interface RegisterResultData {
  user: User;
  events: DomainEvent[];
}

export type RegisterResult = Result<RegisterResultData>;
