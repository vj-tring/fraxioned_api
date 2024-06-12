import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@user/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from '@user/dto/create-user.dto';
import { UpdateUserDTO } from '@user/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDTO: CreateUserDTO = {
        username: 'John Doe',
        email: 'john@example.com',
        password: '',
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
    });

    it('should throw a NotFoundException', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDTO: UpdateUserDTO = {
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
      };
      mockUserRepository.preload.mockReturnValue({ id: 1, ...updateUserDTO });

      const result = await service.update(1, updateUserDTO);

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        ...updateUserDTO,
      });
      expect(repository.save).toHaveBeenCalledWith({ id: 1, ...updateUserDTO });
      expect(result).toEqual({ id: 1, ...updateUserDTO });
    });

    it('should throw a NotFoundException', async () => {
      mockUserRepository.preload.mockReturnValue(null);
      await expect(
        service.update(999, {
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
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockUserRepository.findOneBy.mockReturnValue(user);

      await service.remove(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw a NotFoundException', async () => {
      mockUserRepository.findOneBy.mockReturnValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
