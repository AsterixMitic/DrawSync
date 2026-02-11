import { User } from '../../models';
import { Result } from '../base.result';

export interface LoginResultData {
  user: User;
  accessToken: string;
}

export type LoginResult = Result<LoginResultData>;
