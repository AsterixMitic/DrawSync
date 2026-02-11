import { Injectable } from '@nestjs/common';
import { BaseMapper } from './base.mapper';
import { User } from '../../domain/models';
import { UserEntity } from '../database/entities';

@Injectable()
export class UserMapper extends BaseMapper<User, UserEntity> {
  toDomain(entity: UserEntity): User {
    // if (!entity) return null;
    return new User({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      imgPath: entity.imgPath,
      totalScore: entity.totalScore,
      createdAt: entity.createdAt
    });
  }

  toEntity(domain: User): UserEntity {
    // if (!domain) return null;
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.email = domain.email;
    entity.password = domain.password;
    entity.imgPath = domain.imgPath;
    entity.totalScore = domain.totalScore;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}