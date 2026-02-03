import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoomEntity } from './room.entity';

@Entity({ name: 'players' })
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id' })
  roomId: string;

  @Column({ length: 40 })
  @Index()
  nickname: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @ManyToOne(() => RoomEntity, (room) => room.players, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room?: RoomEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
