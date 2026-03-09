import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { PlayerEntity } from './player.entity.js';
import { RoundEntity } from './round.entity.js';

@Entity('rooms')
export class RoomEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, default: 'WAITING' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'round_count', type: 'int', default: 3 })
  roundCount: number;

  @Column({ name: 'player_max_count', type: 'int', default: 8 })
  playerMaxCount: number;

  @Column('uuid', { name: 'room_owner_id', nullable: true })
  roomOwnerId: string | null;

  @Column('uuid', { name: 'current_round_id', nullable: true })
  currentRoundId: string | null;

  @OneToMany(() => PlayerEntity, (player) => player.room)
  players: PlayerEntity[];

  @OneToMany(() => RoundEntity, (round) => round.room)
  rounds: RoundEntity[];

  @ManyToOne(() => PlayerEntity, { nullable: true })
  @JoinColumn({ name: 'room_owner_id' })
  roomOwner: PlayerEntity;

  @ManyToOne(() => RoundEntity, { nullable: true })
  @JoinColumn({ name: 'current_round_id' })
  currentRound: RoundEntity;
}
