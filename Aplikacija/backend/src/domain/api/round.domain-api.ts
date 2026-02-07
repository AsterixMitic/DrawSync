import { Injectable } from '@nestjs/common';
import { StartRoundCommand } from '../commands/round/start-round.command';
import { CompleteRoundCommand } from '../commands/round/complete-round.command';
import { StartRoundInput, CompleteRoundInput } from '../commands/round';
import { StartRoundResult, CompleteRoundResult } from '../results/round';

@Injectable()
export class RoundDomainApi {
  constructor(
    private readonly startRoundCommand: StartRoundCommand,
    private readonly completeRoundCommand: CompleteRoundCommand
  ) {}

  async startRound(input: StartRoundInput): Promise<StartRoundResult> {
    return this.startRoundCommand.execute(input);
  }

  async completeRound(input: CompleteRoundInput): Promise<CompleteRoundResult> {
    return this.completeRoundCommand.execute(input);
  }
}
