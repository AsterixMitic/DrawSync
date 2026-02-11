import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { AuthDomainModule } from '../../domain/api/auth.domain.module';
import { AuthClientApi } from './auth.client-api';

@Module({
  imports: [
    PersistenceModule,
    AuthDomainModule
  ],
  providers: [
    AuthClientApi
  ],
  exports: [AuthClientApi]
})
export class AuthApplicationModule {}
