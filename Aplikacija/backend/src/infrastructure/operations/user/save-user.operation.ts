import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { User } from '../../../domain/models';
import type { ISaveUserOperationPort } from '../../../domain/ports';
import { UserEntity } from '../../database/entities';
import { UserMapper } from '../../mappers';

export interface SaveUserInput {
  user: User;
}

@Injectable()
export class SaveUserOperation implements ISaveUserOperationPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly mapper: UserMapper
  ) {}

  async execute(input: SaveUserInput): Promise<void> {
    const entity = this.mapper.toEntity(input.user);
    await this.userRepo.save(entity);
  }
}
