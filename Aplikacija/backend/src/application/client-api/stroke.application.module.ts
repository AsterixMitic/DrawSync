import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { StrokeDomainModule } from '../../domain/api/stroke.domain.module';
import { StrokeClientApi } from './stroke.client-api';

@Module({
  imports: [
    PersistenceModule,
    StrokeDomainModule
  ],
  providers: [StrokeClientApi],
  exports: [StrokeClientApi]
})
export class StrokeApplicationModule {}
