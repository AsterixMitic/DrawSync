import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoundStatus } from '../../domain/models/statuses';
import { RoomEntity } from './room.entity';

@Entity({ name: 'rounds' })
export class RoundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'room_id' })
  roomId: string;

  @Column({ name: 'round_number', type: 'int' })
  roundNumber: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  word: string | null;

  @Column({ type: 'enum', enum: RoundStatus, default: RoundStatus.Pending })
  status: RoundStatus;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @ManyToOne(() => RoomEntity, (room) => room.rounds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room?: RoomEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
