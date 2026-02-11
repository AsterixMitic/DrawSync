import { Module } from '@nestjs/common';
import { PersistenceModule } from './infrastructure/persistence.module';
import { TransportModule } from './transport/transport.module';

@Module({
  imports: [PersistenceModule, TransportModule],
})
export class AppModule {}
