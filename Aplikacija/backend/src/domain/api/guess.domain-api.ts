import { Injectable } from '@nestjs/common';
import { SubmitGuessCommand } from '../commands/guess/submit-guess.command';
import { SubmitGuessInput } from '../commands/guess';
import { SubmitGuessResult } from '../results/guess';

@Injectable()
export class GuessDomainApi {
  constructor(private readonly submitGuessCommand: SubmitGuessCommand) {}

  async submitGuess(input: SubmitGuessInput): Promise<SubmitGuessResult> {
    return this.submitGuessCommand.execute(input);
  }
}
