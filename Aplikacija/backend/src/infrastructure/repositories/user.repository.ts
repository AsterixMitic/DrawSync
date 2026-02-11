import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/models';
import { IUserRepositoryPort } from '../../domain/ports';
import { UserEntity } from '../database/entities';
import { UserMapper } from '../mappers';

@Injectable()
export class UserRepository implements IUserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly mapper: UserMapper
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.userRepo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepo.findOne({ where: { email } });
    return entity ? this.mapper.toDomain(entity) : null;
  }
}
