import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'controllers/user.controller';
import { UserService } from 'services/user.service';
import { Repository } from 'typeorm';
import { User } from 'entities/user.entity';
import { Role } from 'entities/role.entity';
import { LoggerService } from 'services/logger.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { USER_RESPONSES } from 'commons/constants/response-constants/user.constant';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { CreateUserDTO } from 'src/main/dto/requests/user/create-user.dto';
import { UpdateUserDTO } from 'src/main/dto/requests/user/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserContactDetails),
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
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
        Reflector,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
      } as CreateUserDTO;

      jest
        .spyOn(service, 'createUser')
        .mockResolvedValue(USER_RESPONSES.USER_CREATED({ id: 1 }));

      const result = await controller.createUser(createUserDto);
      expect(result).toEqual(USER_RESPONSES.USER_CREATED({ id: 1 }));
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, firstName: 'John', lastName: 'Doe' } as User];
      jest
        .spyOn(service, 'getUsers')
        .mockResolvedValue(USER_RESPONSES.USERS_FETCHED(users));

      const result = await controller.getUsers();
      expect(result).toEqual(USER_RESPONSES.USERS_FETCHED(users));
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const user = { id: 1, firstName: 'John', lastName: 'Doe' };
      jest
        .spyOn(service, 'getUserById')
        .mockResolvedValue(USER_RESPONSES.USER_FETCHED(user));

      const result = await controller.getUserById(1);
      expect(result).toEqual(USER_RESPONSES.USER_FETCHED(user));
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
      } as UpdateUserDTO;

      const updatedUser = { id: 1, firstName: 'John', lastName: 'Doe' };
      jest
        .spyOn(service, 'updateUser')
        .mockResolvedValue(USER_RESPONSES.USER_UPDATED(updatedUser));

      const result = await controller.updateUser(1, updateUserDto);
      expect(result).toEqual(USER_RESPONSES.USER_UPDATED(updatedUser));
    });
  });
});
