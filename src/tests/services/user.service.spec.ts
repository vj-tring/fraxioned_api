import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'services/user.service';
import { Repository, DeleteResult } from 'typeorm';
import { User } from 'entities/user.entity';
import { Role } from 'src/main/entities/role.entity';
import { UserContactDetails } from 'entities/user_contact_details.entity';
import { LoggerService } from 'services/logger.service';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.response.constant';
import { CreateUserDTO } from 'dto/requests/create-user.dto';
import { UpdateUserDTO } from 'dto/requests/update-user.dto';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let userContactDetailsRepository: Repository<UserContactDetails>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    userContactDetailsRepository = module.get<Repository<UserContactDetails>>(
      getRepositoryToken(UserContactDetails),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  describe('createUser', () => {
    it('should return USER_NOT_FOUND if role does not exist', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
        contactDetails: [],
      } as CreateUserDTO;

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(
        USER_RESPONSES.USER_NOT_FOUND(createUserDto.role.id),
      );
    });

    it('should return USER_ALREADY_EXISTS if user already exists', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(new Role());
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ id: 1 } as User);

      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
        contactDetails: [],
      } as CreateUserDTO;

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(USER_RESPONSES.USER_ALREADY_EXISTS(1));
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should create a new user and return USER_CREATED', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(new Role());
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ id: 1 } as User);
      jest
        .spyOn(userContactDetailsRepository, 'save')
        .mockResolvedValue({ id: 1 } as UserContactDetails);

      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
        contactDetails: [],
      } as CreateUserDTO;

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(USER_RESPONSES.USER_CREATED({ id: 1 }));
      expect(logger.log).toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('should return USERS_NOT_FOUND if no users exist', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([]);

      const result = await service.getUsers();
      expect(result).toEqual(USER_RESPONSES.USERS_NOT_FOUND());
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should return USERS_FETCHED if users exist', async () => {
      const users = [
        { id: 1, firstName: 'John', lastName: 'Doe', contactDetails: [] },
      ] as unknown as User[];
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);

      const result = await service.getUsers();
      expect(result).toEqual(USER_RESPONSES.USERS_FETCHED(users));
      expect(logger.log).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return USER_NOT_FOUND if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getUserById(1);
      expect(result).toEqual(USER_RESPONSES.USER_NOT_FOUND(1));
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should return USER_FETCHED if user exists', async () => {
      const user = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        contactDetails: [],
      } as unknown as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.getUserById(1);
      expect(result).toEqual(USER_RESPONSES.USER_FETCHED(user));
      expect(logger.log).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should return USER_NOT_FOUND if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const updateUserDto: UpdateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
        contactDetails: [],
      } as UpdateUserDTO;

      const result = await service.updateUser(1, updateUserDto);
      expect(result).toEqual(USER_RESPONSES.USER_NOT_FOUND(1));
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should return USER_NOT_FOUND if role does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(new User());
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      const updateUserDto: UpdateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
        contactDetails: [],
      } as UpdateUserDTO;

      const result = await service.updateUser(1, updateUserDto);
      expect(result).toEqual(
        USER_RESPONSES.USER_NOT_FOUND(updateUserDto.role.id),
      );
    });

    it('should update the user and return USER_UPDATED', async () => {
      const user = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        contactDetails: [],
      } as unknown as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(new Role());
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest
        .spyOn(userContactDetailsRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);
      jest
        .spyOn(userContactDetailsRepository, 'save')
        .mockResolvedValue({ id: 1 } as UserContactDetails);

      const updateUserDto: UpdateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
        contactDetails: [],
      } as UpdateUserDTO;

      const result = await service.updateUser(1, updateUserDto);
      expect(result).toEqual(USER_RESPONSES.USER_UPDATED(user));
      expect(logger.log).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should return USER_NOT_FOUND if user does not exist', async () => {
      const deleteResult: DeleteResult = { affected: 0, raw: [] };
      jest.spyOn(userRepository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.deleteUser(1);
      expect(result).toEqual(USER_RESPONSES.USER_NOT_FOUND(1));
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should delete the user and return USER_DELETED', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: [] };
      jest.spyOn(userRepository, 'delete').mockResolvedValue(deleteResult);
      jest
        .spyOn(userContactDetailsRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as DeleteResult);

      const result = await service.deleteUser(1);
      expect(result).toEqual(USER_RESPONSES.USER_DELETED);
      expect(logger.log).toHaveBeenCalled();
    });
  });
});
