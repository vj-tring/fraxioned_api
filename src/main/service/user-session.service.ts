import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from 'entities/user-session.entity';
import { CreateUserSessionDTO } from 'dto/requests/create-user-session.dto';
import { UpdateUserSessionDTO } from 'dto/requests/update-user-session.dto';
import { LoggerService } from 'services/logger.service';
import { USER_SESSION_RESPONSES } from 'src/main/commons/constants/response-constants/user-session.constant';

@Injectable()
export class UserSessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    private readonly logger: LoggerService,
  ) {}

  async createUserSession(
    createUserSessionDto: CreateUserSessionDTO,
  ): Promise<object> {
    const userSession = new UserSession();
    userSession.user = createUserSessionDto.user;
    userSession.token = createUserSessionDto.token;
    userSession.expiresAt = createUserSessionDto.expiresAt;

    const savedUserSession = await this.userSessionRepository.save(userSession);
    this.logger.log(`User session created with ID ${savedUserSession.id}`);
    return USER_SESSION_RESPONSES.USER_SESSION_CREATED(savedUserSession);
  }

  async getUserSessions(): Promise<object> {
    this.logger.log('Fetching all user sessions');
    const userSessions = await this.userSessionRepository.find();
    if (userSessions.length === 0) {
      this.logger.warn('No user sessions found');
      return USER_SESSION_RESPONSES.USER_SESSIONS_NOT_FOUND();
    }
    return USER_SESSION_RESPONSES.USER_SESSIONS_FETCHED(userSessions);
  }

  async getUserSessionById(id: number): Promise<UserSession> {
    this.logger.log(`Fetching user session with ID ${id}`);
    const userSession = await this.userSessionRepository.findOne({
      where: { id },
    });
    if (!userSession) {
      this.logger.warn(`User session with ID ${id} not found`);
      throw new NotFoundException(`User session with ID ${id} not found`);
    }
    return userSession;
  }

  async updateUserSession(
    id: number,
    updateUserSessionDto: UpdateUserSessionDTO,
  ): Promise<object> {
    const userSession = await this.userSessionRepository.findOne({
      where: { id },
    });
    if (!userSession) {
      this.logger.warn(`User session with ID ${id} not found`);
      throw new NotFoundException(`User session with ID ${id} not found`);
    }
    Object.assign(userSession, updateUserSessionDto);
    const updatedUserSession =
      await this.userSessionRepository.save(userSession);
    this.logger.log(`User session with ID ${id} updated`);
    return USER_SESSION_RESPONSES.USER_SESSION_UPDATED(updatedUserSession);
  }

  async deleteUserSession(id: number): Promise<object> {
    const result = await this.userSessionRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`User session with ID ${id} not found`);
      throw new NotFoundException(`User session with ID ${id} not found`);
    }
    this.logger.log(`User session with ID ${id} deleted`);
    return USER_SESSION_RESPONSES.USER_SESSION_DELETED;
  }
}
