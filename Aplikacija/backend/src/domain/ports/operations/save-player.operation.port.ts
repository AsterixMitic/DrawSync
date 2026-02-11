import { Player } from 'src/domain/models';

export interface ISavePlayerOperationPort {
  execute(input: { player: Player }): Promise<void>;
}
