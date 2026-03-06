import { Module } from '@nestjs/common';
import { PersistenceModule } from './infrastructure/persistence.module';
import { TransportModule } from './transport/transport.module';
import { WsModule } from './transport/ws/ws.module';

@Module({
  imports: [PersistenceModule, TransportModule, WsModule],
})
export class AppModule {}
