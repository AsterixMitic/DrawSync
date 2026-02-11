import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { RoundEntity } from './round.entity';
import { PlayerEntity } from './player.entity';

@Entity('guesses')
export class GuessEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { name: 'round_id' })
  roundId: string;

  @Column('uuid', { name: 'player_id' })
  playerId: string;

  @Column({ name: 'guess_text', type: 'varchar', length: 255 })
  guessText: string;

  @Column({ type: 'timestamp' })
  time: Date;

  @Column({ name: 'right_guess', type: 'boolean', default: false })
  rightGuess: boolean;

  @ManyToOne(() => RoundEntity, (round) => round.guesses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'round_id' })
  round: RoundEntity;

  @ManyToOne(() => PlayerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player: PlayerEntity;
}