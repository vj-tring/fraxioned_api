import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { SpaceService } from 'src/main/service/space.service';
import { SpaceController } from 'src/main/controller/space.controller';
import { CreateSpaceDto } from 'src/main/dto/requests/space/create-space.dto';
import { Space } from 'src/main/entities/space.entity';
import { SPACE_RESPONSES } from 'src/main/commons/constants/response-constants/space.constant';
import { UpdateSpaceDto } from 'src/main/dto/requests/space/update-space.dto';

describe('SpaceController', () => {
  let controller: SpaceController;
  let service: SpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [
        {
          provide: SpaceService,
          useValue: {
            createSpace: jest.fn(),
            findAllSpaces: jest.fn(),
            findSpaceById: jest.fn(),
            updateSpaceDetailById: jest.fn(),
            deleteSpaceById: jest.fn(),
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
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<SpaceController>(SpaceController);
    service = module.get<SpaceService>(SpaceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const createSpaceDto: CreateSpaceDto = {
    name: 'Test Space',
    createdBy: {
      id: 1,
    } as User,
  };

  const updateSpaceDto: UpdateSpaceDto = {
    name: 'Test Space',
    updatedBy: {
      id: 1,
    } as User,
  };

  const expectedSpace: Space = {
    id: 1,
    name: 'Test Space',
    createdBy: { id: 1 } as User,
    updatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    spaceTypes: [],
  };

  const expectedUpdatedSpace: Space = {
    id: 1,
    name: 'Test Space',
    createdBy: { id: 1 } as User,
    updatedBy: { id: 1 } as User,
    createdAt: new Date(),
    updatedAt: new Date(),
    spaceTypes: [],
  };

  describe('createSpace', () => {
    it('should create a space', async () => {
      const expectedResult = SPACE_RESPONSES.SPACE_CREATED(expectedSpace);
      jest.spyOn(service, 'createSpace').mockResolvedValue(expectedResult);

      expect(await controller.createSpace(createSpaceDto)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'createSpace').mockRejectedValue(error);

      try {
        await controller.createSpace(createSpaceDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('An error occurred while creating the space');
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllSpaces', () => {
    it('should get all spaces', async () => {
      const expectedResult = SPACE_RESPONSES.SPACES_FETCHED([]);
      jest.spyOn(service, 'findAllSpaces').mockResolvedValue(expectedResult);

      expect(await controller.getAllSpaces()).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'findAllSpaces').mockRejectedValue(error);

      try {
        await controller.getAllSpaces();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving all spaces',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getSpaceById', () => {
    it('should get space by ID', async () => {
      const expectedResult = SPACE_RESPONSES.SPACE_FETCHED(
        expectedSpace,
        expectedSpace.id,
      );

      const id = 1;
      jest.spyOn(service, 'findSpaceById').mockResolvedValue(expectedResult);

      expect(await controller.getSpaceById(id)).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      const id = 1;
      jest.spyOn(service, 'findSpaceById').mockRejectedValue(error);

      try {
        await controller.getSpaceById(id);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe(
          'An error occurred while retrieving the space',
        );
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('updateSpaceDetail', () => {
    it('should update space details', async () => {
      const expectedResult = SPACE_RESPONSES.SPACE_UPDATED(
        expectedUpdatedSpace,
        expectedUpdatedSpace.id,
      );

      jest
        .spyOn(service, 'updateSpaceDetailById')
        .mockResolvedValue(expectedResult);

      expect(await controller.updateSpaceDetail('1', updateSpaceDto)).toEqual(
        expectedResult,
      );
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'updateSpaceDetailById').mockRejectedValue(error);

      try {
        await controller.updateSpaceDetail('1', {} as UpdateSpaceDto);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('An error occurred while updating the space');
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('deleteSpace', () => {
    it('should delete space by id', async () => {
      const deleteResult = {
        raw: {},
        affected: 1,
      };
      const expectedResult = SPACE_RESPONSES.SPACE_DELETED(
        deleteResult.affected,
      );

      jest.spyOn(service, 'deleteSpaceById').mockResolvedValue(expectedResult);

      expect(await controller.deleteSpace(1)).toEqual(expectedResult);
    });

    it('should throw an HttpException if an error occurs', async () => {
      const error = new Error('An error occurred');
      jest.spyOn(service, 'deleteSpaceById').mockRejectedValue(error);

      try {
        await controller.deleteSpace(1);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('An error occurred while deleting the space');
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
