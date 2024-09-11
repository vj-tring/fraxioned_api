import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from 'src/main/entities/user.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { SpaceTypesController } from 'src/main/controller/space-types.controller';
import { SpaceTypesService } from 'src/main/service/space-types.service';
import { CreateSpaceTypeDto } from 'src/main/dto/requests/space-types/create-space-types.dto';
import { Space } from 'src/main/entities/space.entity';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { SPACE_TYPES_RESPONSES } from 'src/main/commons/constants/response-constants/space-types.constant';
import { UpdateSpaceTypeDto } from 'src/main/dto/requests/space-types/update-space-types.dto';

describe('SpaceTypesController', () => {
  let controller: SpaceTypesController;
  let service: SpaceTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceTypesController],
      providers: [
        {
          provide: SpaceTypesService,
          useValue: {
            createSpaceType: jest.fn(),
            findAllSpaceTypes: jest.fn(),
            findSpaceTypeById: jest.fn(),
            updateSpaceType: jest.fn(),
            removeSpaceType: jest.fn(),
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

    controller = module.get<SpaceTypesController>(SpaceTypesController);
    service = module.get<SpaceTypesService>(SpaceTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const createSpaceTypeDto: CreateSpaceTypeDto = {
    name: 'Test Space type',
    space: {
      id: 1,
    } as Space,
    createdBy: {
      id: 1,
    } as User,
  };

  const updateSpaceTypeDto: UpdateSpaceTypeDto = {
    name: 'Test Space type',
    space: {
      id: 1,
    } as Space,
    updatedBy: {
      id: 1,
    } as User,
  };

  const expectedSpaceType: SpaceTypes = {
    id: 1,
    name: 'Test Space type',
    space: { id: 1 } as Space,
    createdBy: { id: 1 } as User,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: undefined,
  };

  const expectedUpdatedSpaceType: SpaceTypes = {
    id: 1,
    name: 'Test Space type',
    space: { id: 1 } as Space,
    createdBy: { id: 1 } as User,
    updatedBy: { id: 1 } as User,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createSpaceType', () => {
    it('should create a space type', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPE_CREATED(
        expectedSpaceType.name,
        expectedSpaceType.space.id,
        expectedSpaceType,
      );
      jest.spyOn(service, 'createSpaceType').mockResolvedValue(expectedResult);

      expect(await controller.createSpaceType(createSpaceTypeDto)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'createSpaceType').mockRejectedValue(error);

      try {
        await controller.createSpaceType(createSpaceTypeDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while creating the space type',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllSpaceTypes', () => {
    it('should get all space types', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPES_FETCHED([]);
      jest
        .spyOn(service, 'findAllSpaceTypes')
        .mockResolvedValue(expectedResult);

      expect(await controller.getAllSpaceTypes()).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'findAllSpaceTypes').mockRejectedValue(error);

      try {
        await controller.getAllSpaceTypes();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving all space types',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getSpaceTypeById', () => {
    it('should get space type by ID', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPE_FETCHED(
        expectedSpaceType,
        expectedSpaceType.id,
      );

      jest
        .spyOn(service, 'findSpaceTypeById')
        .mockResolvedValue(expectedResult);

      expect(await controller.getSpaceTypeById(1)).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      const id = 1;
      jest.spyOn(service, 'findSpaceTypeById').mockRejectedValue(error);

      try {
        await controller.getSpaceTypeById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the space type',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('updateSpaceTypeDetail', () => {
    it('should update space type details', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPE_UPDATED(
        expectedUpdatedSpaceType,
        expectedUpdatedSpaceType.id,
      );

      jest.spyOn(service, 'updateSpaceType').mockResolvedValue(expectedResult);

      expect(
        await controller.updateSpaceTypeDetail('1', updateSpaceTypeDto),
      ).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'updateSpaceType').mockRejectedValue(error);

      try {
        await controller.updateSpaceTypeDetail('1', {} as UpdateSpaceTypeDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while updating the space type',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteSpaceType', () => {
    it('should delete space type by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPE_DELETED(
        deleteResult.affected,
      );

      jest.spyOn(service, 'removeSpaceType').mockResolvedValue(expectedResult);

      expect(await controller.deleteSpaceType(deleteResult.affected)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'removeSpaceType').mockRejectedValue(error);

      try {
        await controller.deleteSpaceType(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while deleting the space type',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
