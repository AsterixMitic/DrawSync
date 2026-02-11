import { RoundStatus } from 'src/domain/enums';

export interface IUpdateRoundStatusOperationPort {
  execute(input: { roundId: string; status: RoundStatus }): Promise<void>;
}
