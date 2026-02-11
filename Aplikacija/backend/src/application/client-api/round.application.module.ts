import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { RoundDomainModule } from '../../domain/api/round.domain.module';
import { RoundClientApi } from './round.client-api';

@Module({
  imports: [
    PersistenceModule,
    RoundDomainModule
  ],
  providers: [
    RoundClientApi
  ],
  exports: [RoundClientApi]
})
export class RoundApplicationModule {}
