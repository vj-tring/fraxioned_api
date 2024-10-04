import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'services/user.service';
import { Repository } from 'typeorm';
import { User } from 'entities/user.entity';
import { Role } from 'src/main/entities/role.entity';
import { UserContactDetails } from 'entities/user-contact-details.entity';
import { LoggerService } from 'services/logger.service';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.constant';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ROLE_RESPONSES } from 'src/main/commons/constants/response-constants/role.constant';
import { CreateUserDTO } from 'src/main/dto/requests/user/create-user.dto';
import { UpdateUserDTO } from 'src/main/dto/requests/user/update-user.dto';

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
    it('should return ROLE_NOT_FOUND if role does not exist', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
        role: { id: 1 },
        createdBy: 1,
        contactDetails: {},
      } as CreateUserDTO;

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(
        ROLE_RESPONSES.ROLE_NOT_FOUND(createUserDto.role.id),
      );
    });

    it('should return USER_NOT_FOUND if createdBy user does not exist', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(new Role());
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
        role: { id: 1 },
        createdBy: 1,
        contactDetails: {},
      } as CreateUserDTO;

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(
        USER_RESPONSES.USER_NOT_FOUND(createUserDto.createdBy),
      );
    });

    it('should create a user successfully', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(new Role());
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(new User());
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ id: 1 } as User);
      jest
        .spyOn(userContactDetailsRepository, 'save')
        .mockResolvedValue([] as unknown as UserContactDetails);

      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
        role: { id: 1 },
        createdBy: 1,
        contactDetails: {},
      } as CreateUserDTO;

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(USER_RESPONSES.USER_CREATED({ id: 1 } as User));
      expect(logger.log).toHaveBeenCalledWith('User created with ID 1');
    });

    it('should hash the password before saving the user', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(new Role());
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(new User());
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ id: 1 } as User);
      jest
        .spyOn(userContactDetailsRepository, 'save')
        .mockResolvedValue([] as unknown as UserContactDetails);

      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
        role: { id: 1 },
        createdBy: 1,
        contactDetails: {},
      } as CreateUserDTO;

      await service.createUser(createUserDto);
    });

    it('should save contact details correctly', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(new Role());
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(new User());
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ id: 1 } as User);
      const saveContactDetailsSpy = jest
        .spyOn(userContactDetailsRepository, 'save')
        .mockResolvedValue([] as unknown as UserContactDetails);

      const createUserDto: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
        role: { id: 1 },
        createdBy: 1,
        contactDetails: {
          primaryEmail: 'john.doe@example.com',
          primaryPhone: '1234567890',
        },
      } as unknown as CreateUserDTO;

      await service.createUser(createUserDto);
      expect(saveContactDetailsSpy).toHaveBeenCalledWith({
        createdAt: undefined,
        createdBy: {},
        optionalEmailOne: undefined,
        optionalEmailTwo: undefined,
        optionalPhoneOne: undefined,
        optionalPhoneTwo: undefined,
        primaryEmail: 'john.doe@example.com',
        primaryPhone: '1234567890',
        secondaryEmail: undefined,
        secondaryPhone: undefined,
        updatedAt: undefined,
        updatedBy: {},
        user: { id: 1 },
      });
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
        contactDetails: {},
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
        contactDetails: {},
      } as UpdateUserDTO;

      const result = await service.updateUser(1, updateUserDto);
      expect(result).toEqual(
        ROLE_RESPONSES.ROLE_NOT_FOUND(updateUserDto.role.id),
      );
    });

    it('should update the user and return USER_UPDATED', async () => {
      const user = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        contactDetails: {},
      } as User;

      const updatedUser = {
        ...user,
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
        contactDetails: {},
      } as User;

      const role = new Role();
      role.id = 1;

      const updatedByUser = { id: 2 } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);

      jest.spyOn(roleRepository, 'findOne').mockResolvedValueOnce(role);

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(updatedByUser);

      jest
        .spyOn(userContactDetailsRepository, 'findOne')
        .mockResolvedValueOnce(user.contactDetails);

      jest.spyOn(userContactDetailsRepository, 'merge').mockReturnValue(null);

      jest.spyOn(userContactDetailsRepository, 'save').mockReturnValue(null);

      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(updatedUser);

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(updatedUser);

      const updateUserDto: UpdateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 1 },
        contactDetails: {},
        updatedBy: 2,
      } as UpdateUserDTO;

      const result = await service.updateUser(1, updateUserDto);

      expect(result).toEqual(USER_RESPONSES.USER_UPDATED(updatedUser));
      expect(logger.log).toHaveBeenCalledWith(
        'User with ID 1 updated successfully',
      );
    });
  });

  describe('setActiveStatus', () => {
    it('should return USER_NOT_FOUND if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.setActiveStatus(1, false);
      expect(result).toEqual(USER_RESPONSES.USER_NOT_FOUND(1));
      expect(logger.warn).toHaveBeenCalledWith('User with ID 1 not found');
    });

    it('should return USER_ALREADY_IN_STATE if user is already in the desired state', async () => {
      const user = { id: 1, isActive: false } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.setActiveStatus(1, false);
      expect(result).toEqual(
        USER_RESPONSES.USER_ALREADY_IN_STATE(1, 'inactive'),
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'User with ID 1 is already inactive',
      );
    });

    it('should activate the user and return USER_STATE_CHANGED', async () => {
      const user = { id: 1, isActive: false } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...user, isActive: true });

      const result = await service.setActiveStatus(1, true);
      expect(result).toEqual(USER_RESPONSES.USER_STATE_CHANGED(1, 'activated'));
      expect(logger.log).toHaveBeenCalledWith('User with ID 1 activated');
    });

    it('should deactivate the user and return USER_STATE_CHANGED', async () => {
      const user = { id: 1, isActive: true } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue({ ...user, isActive: false });

      const result = await service.setActiveStatus(1, false);
      expect(result).toEqual(
        USER_RESPONSES.USER_STATE_CHANGED(1, 'deactivated'),
      );
      expect(logger.log).toHaveBeenCalledWith('User with ID 1 deactivated');
    });
  });
});
