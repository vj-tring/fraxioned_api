import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { UserSessionService } from 'services/user-session.service';
import { UserSession } from 'entities/user-session.entity';
import { LoggerService } from 'services/logger.service';
import { CreateUserSessionDTO } from 'dto/requests/create-user-session.dto';
import { UpdateUserSessionDTO } from 'dto/requests/update-user-session.dto';
import { USER_SESSION_RESPONSES } from 'src/main/commons/constants/response-constants/user-session.response.constant';
import { NotFoundException } from '@nestjs/common';
import { User } from 'entities/user.entity';

describe('UserSessionService', () => {
  let service: UserSessionService;
  let repository: Repository<UserSession>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSessionService,
        {
          provide: getRepositoryToken(UserSession),
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserSessionService>(UserSessionService);
    repository = module.get<Repository<UserSession>>(
      getRepositoryToken(UserSession),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserSession', () => {
    it('should create a new user session', async () => {
      const createUserSessionDto: CreateUserSessionDTO = {
        user: { id: 1 } as User,
        token: 'test-token',
        expiresAt: new Date(),
        createdBy: new User(),
        updatedBy: new User(),
      };

      const savedUserSession = {
        ...createUserSessionDto,
        id: 1,
      } as unknown as UserSession;

      jest.spyOn(repository, 'save').mockResolvedValue(savedUserSession);

      const result = await service.createUserSession(createUserSessionDto);

      expect(result).toEqual(
        USER_SESSION_RESPONSES.USER_SESSION_CREATED(savedUserSession),
      );
      expect(logger.log).toHaveBeenCalledWith(
        `User session created with ID ${savedUserSession.id}`,
      );
    });
  });

  describe('getUserSessions', () => {
    it('should return all user sessions', async () => {
      const userSessions = [{ id: 1, token: 'test-token' }] as UserSession[];

      jest.spyOn(repository, 'find').mockResolvedValue(userSessions);

      const result = await service.getUserSessions();

      expect(result).toEqual(
        USER_SESSION_RESPONSES.USER_SESSIONS_FETCHED(userSessions),
      );
      expect(logger.log).toHaveBeenCalledWith('Fetching all user sessions');
    });

    it('should return USER_SESSIONS_NOT_FOUND if no user sessions found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.getUserSessions();

      expect(result).toEqual(USER_SESSION_RESPONSES.USER_SESSIONS_NOT_FOUND());
      expect(logger.log).toHaveBeenCalledWith('Fetching all user sessions');
      expect(logger.warn).toHaveBeenCalledWith('No user sessions found');
    });
  });

  describe('getUserSessionById', () => {
    it('should return a user session by ID', async () => {
      const userSession = { id: 1, token: 'test-token' } as UserSession;

      jest.spyOn(repository, 'findOne').mockResolvedValue(userSession);

      const result = await service.getUserSessionById(1);

      expect(result).toEqual(userSession);
      expect(logger.log).toHaveBeenCalledWith(
        'Fetching user session with ID 1',
      );
    });

    it('should throw NotFoundException if user session not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserSessionById(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User session with ID 1 not found',
      );
    });
  });

  describe('updateUserSession', () => {
    it('should update a user session', async () => {
      const updateUserSessionDto: UpdateUserSessionDTO = {
        token: 'updated-token',
        expiresAt: new Date(),
        updatedBy: new User(),
      };

      const existingUserSession = {
        id: 1,
        token: 'test-token',
        expiresAt: new Date(),
        user: { id: 1 } as User,
      } as UserSession;

      const updatedUserSession = {
        ...existingUserSession,
        ...updateUserSessionDto,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingUserSession);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedUserSession);

      const result = await service.updateUserSession(1, updateUserSessionDto);

      expect(result).toEqual(
        USER_SESSION_RESPONSES.USER_SESSION_UPDATED(updatedUserSession),
      );
      expect(logger.log).toHaveBeenCalledWith('User session with ID 1 updated');
    });

    it('should throw NotFoundException if user session not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const updateUserSessionDto: UpdateUserSessionDTO = {
        token: 'updated-token',
        expiresAt: new Date(),
        updatedBy: new User(),
      };

      await expect(
        service.updateUserSession(1, updateUserSessionDto),
      ).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith(
        'User session with ID 1 not found',
      );
    });
  });

  describe('deleteUserSession', () => {
    it('should delete a user session', async () => {
      const deleteResult: DeleteResult = { affected: 1 } as DeleteResult;

      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.deleteUserSession(1);

      expect(result).toEqual(USER_SESSION_RESPONSES.USER_SESSION_DELETED);
      expect(logger.log).toHaveBeenCalledWith('User session with ID 1 deleted');
    });

    it('should throw NotFoundException if user session not found', async () => {
      const deleteResult: DeleteResult = { affected: 0 } as DeleteResult;

      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      await expect(service.deleteUserSession(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User session with ID 1 not found',
      );
    });
  });
});
