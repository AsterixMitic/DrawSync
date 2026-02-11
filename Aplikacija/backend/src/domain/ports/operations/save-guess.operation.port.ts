import { Guess } from 'src/domain/models';

export interface ISaveGuessOperationPort {
  execute(input: { guess: Guess }): Promise<void>;
}
