import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersistenceModule } from './infrastructure/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
