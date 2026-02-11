import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { RoundEntity } from './round.entity';

@Entity('strokes')
export class StrokeEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'round_id' })
  roundId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'jsonb' })
  points: object[];

  @Column({ type: 'jsonb' })
  style: object;

  @ManyToOne(() => RoundEntity, (round) => round.strokes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'round_id' })
  round: RoundEntity;
}