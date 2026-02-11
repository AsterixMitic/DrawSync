import type { User } from '../../models';

export interface ISaveUserOperationPort {
  execute(input: { user: User }): Promise<void>;
}
