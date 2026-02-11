import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { StartRoundCommand } from '../commands/round/start-round.command';
import { CompleteRoundCommand } from '../commands/round/complete-round.command';
import { RoundDomainApi } from './round.domain-api';

@Module({
  imports: [PersistenceModule],
  providers: [
    StartRoundCommand,
    CompleteRoundCommand,
    RoundDomainApi
  ],
  exports: [RoundDomainApi]
})
export class RoundDomainModule {}
