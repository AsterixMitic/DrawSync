import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { PlayerEntity } from './player.entity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'img_path', type: 'varchar', length: 500, nullable: true })
  imgPath: string | null;

  @Column({ name: 'total_score', type: 'int', default: 0 })
  totalScore: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => PlayerEntity, (player) => player.user)
  players: PlayerEntity[];
}