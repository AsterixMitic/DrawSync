import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { SubmitGuessCommand } from '../commands/guess/submit-guess.command';
import { GuessDomainApi } from './guess.domain-api';

@Module({
  imports: [PersistenceModule],
  providers: [
    SubmitGuessCommand,
    GuessDomainApi
  ],
  exports: [GuessDomainApi]
})
export class GuessDomainModule {}
