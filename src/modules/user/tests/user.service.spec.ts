import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@user/user.entity';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDTO } from '@user/dto/create-user.dto';
import { UpdateUserDTO } from '@user/dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '@logger/logger.service';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  let logger: LoggerService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((user) => ({
      id: Date.now(),
      ...user,
    })),
    find: jest.fn().mockResolvedValue([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
    ]),
    findOneBy: jest
      .fn()
      .mockImplementation(({ id }) =>
        id === 1
          ? { id: 1, name: 'John Doe', email: 'john@example.com' }
          : null,
      ),
    preload: jest.fn().mockImplementation((user) => user),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    logger = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDTO: CreateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        phone: '',
        secondaryPhone: '',
        secondaryEmail: '',
        address1: '',
        address2: '',
        state: '',
        city: '',
        zip: '',
        imageUrl: '',
      };
      const hashedPassword = createUserDTO.password;
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      const result = await service.create(createUserDTO);

      expect(repository.create).toHaveBeenCalledWith(createUserDTO);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDTO.password, 10);
      expect(repository.save).toHaveBeenCalledWith({
        ...createUserDTO,
        password: hashedPassword,
      });
      expect(result).toEqual({
        id: expect.any(Number),
        ...createUserDTO,
        password: hashedPassword,
      });

      expect(logger.log).toHaveBeenCalledTimes(2);
      expect(logger.log).toHaveBeenNthCalledWith(1, 'Creating a new user');
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('User created with ID'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
      ]);
      expect(repository.find).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith('Fetching all users');
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(logger.log).toHaveBeenCalledWith('Fetching user with ID 1');
    });

    it('should throw an HttpException', async () => {
      await expect(service.findOne(999)).rejects.toThrow(HttpException);
      expect(logger.warn).toHaveBeenCalledWith('User with ID 999 not found');

      try {
        await service.findOne(999);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User with ID 999 not found');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDTO: UpdateUserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'John Doe Updated',
        id: 1,
        phone: '',
        secondaryPhone: '',
        email: '',
        secondaryEmail: '',
        address1: '',
        address2: '',
        state: '',
        city: '',
        zip: '',
        imageUrl: '',
        password: '',
      };
      mockUserRepository.preload.mockReturnValue({ id: 1, ...updateUserDTO });

      const result = await service.update(1, updateUserDTO);

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        ...updateUserDTO,
      });
      expect(repository.save).toHaveBeenCalledWith({ id: 1, ...updateUserDTO });
      expect(result).toEqual({ id: 1, ...updateUserDTO });

      expect(logger.log).toHaveBeenCalledTimes(2);
      expect(logger.log).toHaveBeenNthCalledWith(1, 'Updating user with ID 1');
      expect(logger.log).toHaveBeenNthCalledWith(2, 'User with ID 1 updated');
    });

    it('should throw an HttpException', async () => {
      mockUserRepository.preload.mockReturnValue(null);
      await expect(
        service.update(999, {
          firstName: 'John',
          lastName: 'Doe',
          username: 'John Doe Updated',
          id: 0,
          phone: '',
          secondaryPhone: '',
          email: '',
          secondaryEmail: '',
          address1: '',
          address2: '',
          state: '',
          city: '',
          zip: '',
          imageUrl: '',
          password: '',
        }),
      ).rejects.toThrow(HttpException);
      expect(logger.warn).toHaveBeenCalledWith('User with ID 999 not found');

      try {
        await service.update(999, {
          firstName: '',
          lastName: '',
          username: 'John Doe Updated',
          id: 0,
          phone: '',
          secondaryPhone: '',
          email: '',
          secondaryEmail: '',
          address1: '',
          address2: '',
          state: '',
          city: '',
          zip: '',
          imageUrl: '',
          password: '',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User with ID 999 not found');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockUserRepository.findOneBy.mockReturnValue(user);

      await service.remove(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.remove).toHaveBeenCalledWith(user);
      expect(logger.log).toHaveBeenCalledWith('Removing user with ID 1');
      expect(logger.log).toHaveBeenCalledWith('User with ID 1 removed');
    });

    it('should throw an HttpException', async () => {
      mockUserRepository.findOneBy.mockReturnValue(null);
      await expect(service.remove(999)).rejects.toThrow(HttpException);
      expect(logger.warn).toHaveBeenCalledWith('User with ID 999 not found');

      try {
        await service.remove(999);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User with ID 999 not found');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
