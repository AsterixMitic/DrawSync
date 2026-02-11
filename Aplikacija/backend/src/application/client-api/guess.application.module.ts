import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { GuessDomainModule } from '../../domain/api/guess.domain.module';
import { GuessClientApi } from './guess.client-api';

@Module({
  imports: [
    PersistenceModule,
    GuessDomainModule
  ],
  providers: [GuessClientApi],
  exports: [GuessClientApi]
})
export class GuessApplicationModule {}
