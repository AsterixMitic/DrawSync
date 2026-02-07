import { DataSource } from 'typeorm';
import {
  GuessEntity,
  PlayerEntity,
  RoomEntity,
  RoundEntity,
  StrokeEntity,
  StrokeEventEntity,
  UserEntity
} from './entities';

export const typeOrmConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'drawsync',
  entities: [
    UserEntity,
    PlayerEntity,
    RoomEntity,
    RoundEntity,
    StrokeEntity,
    StrokeEventEntity,
    GuessEntity
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false
};

export const AppDataSource = new DataSource(typeOrmConfig);
