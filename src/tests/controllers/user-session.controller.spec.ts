import { Test, TestingModule } from '@nestjs/testing';
import { UserSessionController } from 'controllers/user-session.controller';
import { UserSessionService } from 'services/user-session.service';
import { UpdateUserSessionDTO } from 'src/main/dto/requests/user-session/update-user-session.dto';
import { USER_SESSION_RESPONSES } from 'src/main/commons/constants/response-constants/user-session.constant';
import { User } from 'entities/user.entity';
import { UserSession } from 'src/main/entities/user-session.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { CreateUserSessionDTO } from 'src/main/dto/requests/user-session/create-user-session.dto';

describe('UserSessionController', () => {
  let controller: UserSessionController;
  let service: UserSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSessionController],
      providers: [
        {
          provide: UserSessionService,
          useValue: {
            createUserSession: jest.fn(),
            getUserSessions: jest.fn(),
            getUserSessionById: jest.fn(),
            updateUserSession: jest.fn(),
            deleteUserSession: jest.fn(),
          },
        },
        {
          provide: AuthenticationService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<UserSessionController>(UserSessionController);
    service = module.get<UserSessionService>(UserSessionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      const response = USER_SESSION_RESPONSES.USER_SESSION_CREATED({
        ...createUserSessionDto,
        id: 1,
      });

      jest.spyOn(service, 'createUserSession').mockResolvedValue(response);

      expect(await controller.createUserSession(createUserSessionDto)).toEqual(
        response,
      );
      expect(service.createUserSession).toHaveBeenCalledWith(
        createUserSessionDto,
      );
    });
  });

  describe('getUserSessions', () => {
    it('should return all user sessions', async () => {
      const response = USER_SESSION_RESPONSES.USER_SESSIONS_FETCHED([
        {
          id: 1,
          token: 'test-token',
          user: new User(),
          expiresAt: undefined,
          createdAt: undefined,
        },
      ]);

      jest.spyOn(service, 'getUserSessions').mockResolvedValue(response);

      expect(await controller.getUserSessions()).toEqual(response);
      expect(service.getUserSessions).toHaveBeenCalled();
    });
  });

  describe('getUserSessionById', () => {
    it('should return a user session by ID', async () => {
      const response = { id: 1, token: 'test-token' } as UserSession;

      jest.spyOn(service, 'getUserSessionById').mockResolvedValue(response);

      expect(await controller.getUserSessionById(1)).toEqual(response);
      expect(service.getUserSessionById).toHaveBeenCalledWith(1);
    });
  });

  describe('updateUserSession', () => {
    it('should update a user session', async () => {
      const updateUserSessionDto: UpdateUserSessionDTO = {
        token: 'updated-token',
        expiresAt: new Date(),
        updatedBy: new User(),
      };

      const response = USER_SESSION_RESPONSES.USER_SESSION_UPDATED({
        id: 1,
        ...updateUserSessionDto,
      });

      jest.spyOn(service, 'updateUserSession').mockResolvedValue(response);

      expect(
        await controller.updateUserSession(1, updateUserSessionDto),
      ).toEqual(response);
      expect(service.updateUserSession).toHaveBeenCalledWith(
        1,
        updateUserSessionDto,
      );
    });
  });

  describe('deleteUserSession', () => {
    it('should delete a user session', async () => {
      const response = USER_SESSION_RESPONSES.USER_SESSION_DELETED;

      jest.spyOn(service, 'deleteUserSession').mockResolvedValue(response);

      expect(await controller.deleteUserSession(1)).toEqual(response);
      expect(service.deleteUserSession).toHaveBeenCalledWith(1);
    });
  });
});
