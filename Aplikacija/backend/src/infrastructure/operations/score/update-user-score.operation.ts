import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities';

export interface UpdateUserScoreInput {
  userId: string;
  points: number;
}

@Injectable()
export class UpdateUserScoreOperation {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  async execute(input: UpdateUserScoreInput): Promise<void> {
    await this.userRepo.increment({ id: input.userId }, 'totalScore', input.points);
  }
}
