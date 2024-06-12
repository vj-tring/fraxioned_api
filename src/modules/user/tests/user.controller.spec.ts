import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';
import { CreateUserDTO } from '@user/dto/create-user.dto';
import { UpdateUserDTO } from '@user/dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn((dto) => {
      return {
        id: Date.now(),
        ...dto,
      };
    }),
    findAll: jest.fn(() => {
      return [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
      ];
    }),
    findOne: jest.fn((id) => {
      return { id, name: 'John Doe', email: 'john@example.com' };
    }),
    update: jest.fn((id, dto) => {
      return { id, ...dto };
    }),
    remove: jest.fn((id) => {
      return { id };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDTO = {
        username: 'John Doe',
        email: 'john@example.com',
        phone: '',
        secondaryPhone: '',
        secondaryEmail: '',
        address1: '',
        address2: '',
        state: '',
        city: '',
        zip: '',
        imageUrl: '',
        password: '',
      };
      const result = await controller.create(dto);
      expect(result).toEqual({
        id: expect.any(Number),
        ...dto,
      });
      expect(userService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com' },
      ]);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const id = 1;
      const result = await controller.findOne(id);
      expect(result).toEqual({
        id,
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(userService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = 1;
      const dto: UpdateUserDTO = {
        username: 'John Doe Updated',
        email: 'john_updated@example.com',
        id: 0,
        phone: '',
        secondaryPhone: '',
        secondaryEmail: '',
        address1: '',
        address2: '',
        state: '',
        city: '',
        zip: '',
        imageUrl: '',
        password: '',
      };
      const result = await controller.update(id, dto);
      expect(result).toEqual({ id, ...dto });
      expect(userService.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = 1;
      await controller.remove(id);
      expect(userService.remove).toHaveBeenCalledWith(id);
    });
  });
});
