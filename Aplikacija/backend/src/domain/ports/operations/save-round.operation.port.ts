import { Round } from 'src/domain/models';

export interface ISaveRoundOperationPort {
  execute(input: { round: Round }): Promise<void>;
}
