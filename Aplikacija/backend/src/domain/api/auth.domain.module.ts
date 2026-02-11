import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../infrastructure/persistence.module';
import { RegisterCommand } from '../commands/auth/register.command';
import { LoginCommand } from '../commands/auth/login.command';
import { AuthDomainApi } from './auth.domain-api';

@Module({
  imports: [PersistenceModule],
  providers: [
    RegisterCommand,
    LoginCommand,
    AuthDomainApi
  ],
  exports: [AuthDomainApi]
})
export class AuthDomainModule {}
