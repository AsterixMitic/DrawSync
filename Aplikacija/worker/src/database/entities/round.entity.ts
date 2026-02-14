import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { RoomEntity } from './room.entity.js';
import { PlayerEntity } from './player.entity.js';
import { StrokeEntity } from './stroke.entity.js';
import { GuessEntity } from './guess.entity.js';

@Entity('rounds')
export class RoundEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'round_no', type: 'int' })
  roundNo: number;

  @Column('uuid', { name: 'room_id' })
  roomId: string;

  @Column({ name: 'round_status', type: 'varchar', length: 20, default: 'PENDING' })
  roundStatus: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  word: string;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column('uuid', { name: 'current_drawer_id', nullable: true })
  currentDrawerId: string | null;

  @ManyToOne(() => RoomEntity, (room) => room.rounds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: RoomEntity;

  @ManyToOne(() => PlayerEntity, { nullable: true })
  @JoinColumn({ name: 'current_drawer_id' })
  currentDrawer: PlayerEntity;

  @OneToMany(() => StrokeEntity, (stroke) => stroke.round)
  strokes: StrokeEntity[];

  @OneToMany(() => GuessEntity, (guess) => guess.round)
  guesses: GuessEntity[];
}
