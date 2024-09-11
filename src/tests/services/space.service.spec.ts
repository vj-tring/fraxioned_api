import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { SpaceService } from 'src/main/service/space.service';
import { Space } from 'src/main/entities/space.entity';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { CreateSpaceDto } from 'src/main/dto/requests/space/create-space.dto';
import { UpdateSpaceDto } from 'src/main/dto/requests/space/update-space.dto';
import { SPACE_RESPONSES } from 'src/main/commons/constants/response-constants/space.constant';

describe('SpaceService', () => {
  let service: SpaceService;
  let spaceRepository: Repository<Space>;
  let userRepository: Repository<User>;
  let spaceTypesRepository: Repository<SpaceTypes>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceService,
        {
          provide: getRepositoryToken(Space),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SpaceTypes),
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SpaceService>(SpaceService);
    spaceRepository = module.get<Repository<Space>>(getRepositoryToken(Space));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    spaceTypesRepository = module.get<Repository<SpaceTypes>>(
      getRepositoryToken(SpaceTypes),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

  const user = { id: 1 } as User;

  describe('createSpace', () => {
    it('should create an space', async () => {
      const expectedResult = SPACE_RESPONSES.SPACE_CREATED(expectedSpace);
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(spaceRepository, 'create').mockReturnValue(expectedSpace);
      jest.spyOn(spaceRepository, 'save').mockResolvedValueOnce(expectedSpace);

      expect(await service.createSpace(createSpaceDto)).toEqual(expectedResult);
    });

    it('should return conflict if space already exists', async () => {
      jest
        .spyOn(spaceRepository, 'findOne')
        .mockResolvedValueOnce(expectedSpace);

      const expectedResult = SPACE_RESPONSES.SPACE_ALREADY_EXISTS(
        createSpaceDto.name,
      );
      expect(await service.createSpace(createSpaceDto)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Error creating space: Space ${createSpaceDto.name} already exists`,
      );
    });

    it('should return not found if user does not exist', async () => {
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = SPACE_RESPONSES.USER_NOT_FOUND(
        createSpaceDto.createdBy.id,
      );

      expect(await service.createSpace(createSpaceDto)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createSpaceDto.createdBy.id} does not exist`,
      );
    });

    it('should handle errors during creation', async () => {
      jest
        .spyOn(spaceRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.createSpace(createSpaceDto)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAllSpaces', () => {
    it('should get all space records', async () => {
      const expectedResult = SPACE_RESPONSES.SPACES_FETCHED([expectedSpace]);

      jest.spyOn(spaceRepository, 'find').mockResolvedValue([expectedSpace]);

      expect(await service.findAllSpaces()).toEqual(expectedResult);
    });

    it('should return no spaces if no space found', async () => {
      const expectedResult = SPACE_RESPONSES.SPACES_NOT_FOUND();

      jest.spyOn(spaceRepository, 'find').mockResolvedValue([] as Space[]);

      expect(await service.findAllSpaces()).toEqual(expectedResult);
    });

    it('should handle errors during retrieval of all spaces', async () => {
      jest
        .spyOn(spaceRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findAllSpaces()).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findSpaceById', () => {
    it('should find space by Id', async () => {
      const expectedResult = SPACE_RESPONSES.SPACE_FETCHED(
        expectedSpace,
        expectedSpace.id,
      );

      jest.spyOn(spaceRepository, 'findOne').mockResolvedValue(expectedSpace);
      const id = 1;
      expect(await service.findSpaceById(id)).toEqual(expectedResult);
    });

    it('should return no space exists for the given id', async () => {
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult = SPACE_RESPONSES.SPACE_NOT_FOUND(id);

      expect(await service.findSpaceById(id)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Space with ID ${id} not found`,
      );
    });

    it('should handle errors during retrieval of a space', async () => {
      jest
        .spyOn(spaceRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(service.findSpaceById(id)).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateSpaceDetailById', () => {
    it('should update amenity details', async () => {
      const expectedResult = SPACE_RESPONSES.SPACE_UPDATED(
        expectedUpdatedSpace,
        expectedUpdatedSpace.id,
      );

      jest
        .spyOn(spaceRepository, 'findOne')
        .mockResolvedValueOnce(expectedUpdatedSpace);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(spaceRepository, 'save')
        .mockResolvedValueOnce(expectedUpdatedSpace);

      expect(await service.updateSpaceDetailById(1, updateSpaceDto)).toEqual(
        expectedResult,
      );
    });

    it('should return space not found if amenity does not exist', async () => {
      const id = 1;
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = SPACE_RESPONSES.SPACE_NOT_FOUND(id);

      expect(await service.updateSpaceDetailById(1, updateSpaceDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Space with ID ${id} not found`,
      );
    });

    it('should return user not found if user does not exist', async () => {
      jest
        .spyOn(spaceRepository, 'findOne')
        .mockResolvedValueOnce(expectedUpdatedSpace);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = SPACE_RESPONSES.USER_NOT_FOUND(
        updateSpaceDto.updatedBy.id,
      );

      expect(await service.updateSpaceDetailById(1, updateSpaceDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updateSpaceDto.updatedBy.id} does not exist`,
      );
    });
    it('should handle errors during update of a space', async () => {
      jest
        .spyOn(spaceRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.updateSpaceDetailById(1, updateSpaceDto),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteSpaceById', () => {
    it('should log a message and return foreign key conflict response if space is mapped to a space type', async () => {
      const spaceId = 1;
      const mockSpaceType = new SpaceTypes();
      mockSpaceType.id = spaceId;

      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockResolvedValue(mockSpaceType);
      const loggerSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        SPACE_RESPONSES.SPACE_FOREIGN_KEY_CONFLICT(spaceId);

      const result = await service.deleteSpaceById(spaceId);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Space ID ${spaceId} exists and is mapped to space type, hence cannot be deleted.`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return space not found response if space is not found', async () => {
      jest.spyOn(spaceTypesRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(spaceRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 0 });
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      const expectedResponse = SPACE_RESPONSES.SPACE_NOT_FOUND(1);

      const result = await service.deleteSpaceById(1);

      expect(loggerErrorSpy).toHaveBeenCalledWith(`Space with ID 1 not found`);
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return success response if space is deleted successfully', async () => {
      jest.spyOn(spaceTypesRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(spaceRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 1 });
      const loggerLogSpy = jest.spyOn(logger, 'log');
      const expectedResponse = SPACE_RESPONSES.SPACE_DELETED(1);

      const result = await service.deleteSpaceById(1);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Space with ID 1 deleted successfully`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an HttpException if an error occurs during deletion of space', async () => {
      const error = new Error('An error occurred');

      jest.spyOn(spaceTypesRepository, 'findOne').mockRejectedValue(error);
      const loggerErrorSpy = jest.spyOn(logger, 'error');

      try {
        await service.deleteSpaceById(1);
      } catch (err) {
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          `Error deleting space with ID 1: ${error.message} - ${error.stack}`,
        );
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('An error occurred while deleting the space');
        expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
