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

const defaultHost =
  process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost';

export const typeOrmConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? process.env.POSTGRES_HOST ?? defaultHost,
  port: Number(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? 5432),
  username: process.env.DB_USER ?? process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? process.env.POSTGRES_DB ?? 'drawsync',
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
