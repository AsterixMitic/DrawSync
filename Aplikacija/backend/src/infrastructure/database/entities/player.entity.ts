import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { UserEntity } from './user.entity';
import { RoomEntity } from './room.entity';

@Entity('players')
export class PlayerEntity {
  @PrimaryColumn('uuid', { name: 'player_id' })
  playerId: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('uuid', { name: 'room_id' })
  roomId: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({
    name: 'player_state',
    type: 'varchar',
    length: 20,
    default: 'WAITING'
  })
  playerState: string;

  @ManyToOne(() => UserEntity, (user) => user.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: RoomEntity;
}