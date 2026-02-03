import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { RoundEntity } from './round.entity';
import { StrokeEntity } from './stroke.entity';

@Entity('stroke_events')
export class StrokeEventEntity {
  @PrimaryColumn('uuid', { name: 'event_id' })
  eventId: string;

  @Column('uuid', { name: 'round_id' })
  roundId: string;

  @Column({ type: 'int' })
  seq: number;

  @Column({ name: 'stroke_type', type: 'varchar', length: 20 })
  strokeType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column('uuid', { name: 'stroke_id', nullable: true })
  strokeId: string | null;

  @ManyToOne(() => RoundEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'round_id' })
  round: RoundEntity;

  @ManyToOne(() => StrokeEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'stroke_id' })
  stroke: StrokeEntity;
}