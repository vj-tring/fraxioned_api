import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserQuery, UserQueryHelper } from './user.query';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.query(
      UserQueryHelper.getQuery(UserQuery.FIND_ALL),
    );
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.query(
      UserQueryHelper.getQuery(UserQuery.FIND_BY_ID),
      [id],
    );
  }

  async findByInviteToken(token: string): Promise<User> {
    return this.userRepository.query(
      UserQueryHelper.getQuery(UserQuery.FIND_BY_INVITE_TOKEN),
      [token],
    );
  }

  async save(user: User): Promise<User> {
    return this.userRepository.query(UserQueryHelper.getQuery(UserQuery.SAVE), [
      user.roleId,
      user.username,
      user.phone,
      user.email,
      user.password,
      user.isActive,
      user.currentSessionId,
      user.resetToken,
      user.inviteToken,
    ]);
  }

  async create(user: User): Promise<User> {
    return this.userRepository.query(
      UserQueryHelper.getQuery(UserQuery.CREATE),
      [user.roleId, user.email, user.inviteToken],
    );
  }

  async deleteById(id: number): Promise<void> {
    return this.userRepository.query(
      UserQueryHelper.getQuery(UserQuery.DELETE_BY_ID),
      [id],
    );
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.query(
      UserQueryHelper.getQuery(UserQuery.FIND_BY_EMAIL),
      [email],
    );
  }

  async findByResetToken(token: string): Promise<User> {
    return this.userRepository.query(
      UserQueryHelper.getQuery(UserQuery.FIND_BY_RESET_TOKEN),
      [token],
    );
  }
}
