import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RoomStatus } from '../../domain/models/statuses';
import { PlayerEntity } from './player.entity';
import { RoundEntity } from './round.entity';

@Entity({ name: 'rooms' })
export class RoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 12 })
  @Index({ unique: true })
  code: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.Waiting })
  status: RoomStatus;

  @OneToMany(() => RoundEntity, (round) => round.room, { cascade: ['insert', 'update'] })
  rounds?: RoundEntity[];

  @OneToMany(() => PlayerEntity, (player) => player.room, { cascade: ['insert', 'update'] })
  players?: PlayerEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
