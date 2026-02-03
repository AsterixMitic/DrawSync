import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomModule } from './room/room.module';
import { PlayerEntity } from './persistence/entities/player.entity';
import { RoomEntity } from './persistence/entities/room.entity';
import { RoundEntity } from './persistence/entities/round.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '.env.local', '../.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'postgres'),
        port: Number(configService.get<string>('POSTGRES_PORT', '5432')),
        username: configService.get<string>('POSTGRES_USER', 'drawsync'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'drawsync'),
        database: configService.get<string>('POSTGRES_DB', 'drawsync'),
        entities: [RoomEntity, RoundEntity, PlayerEntity],
        synchronize: configService.get<string>('TYPEORM_SYNC', 'true') === 'true',
        logging: configService.get<string>('TYPEORM_LOGGING', 'false') === 'true',
      }),
    }),
    RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
