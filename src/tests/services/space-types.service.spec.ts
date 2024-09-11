import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import { LoggerService } from 'src/main/service/logger.service';
import { User } from 'src/main/entities/user.entity';
import { Amenities } from 'src/main/entities/amenities.entity';
import { SpaceTypesService } from 'src/main/service/space-types.service';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { Space } from 'src/main/entities/space.entity';
import { CreateSpaceTypeDto } from 'src/main/dto/requests/space-types/create-space-types.dto';
import { UpdateSpaceTypeDto } from 'src/main/dto/requests/space-types/update-space-types.dto';
import { SPACE_TYPES_RESPONSES } from 'src/main/commons/constants/response-constants/space-types.constant';
import { SPACE_RESPONSES } from 'src/main/commons/constants/response-constants/space.constant';

describe('SpaceTypesService', () => {
  let service: SpaceTypesService;
  let spaceTypesRepository: Repository<SpaceTypes>;
  let spaceRepository: Repository<Space>;
  let usersRepository: Repository<User>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpaceTypesService,
        {
          provide: getRepositoryToken(SpaceTypes),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Space),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Amenities),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
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

    service = module.get<SpaceTypesService>(SpaceTypesService);
    spaceTypesRepository = module.get<Repository<SpaceTypes>>(
      getRepositoryToken(SpaceTypes),
    );
    spaceRepository = module.get<Repository<Space>>(getRepositoryToken(Space));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));

    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

  const user = { id: 1 } as User;
  const space = { id: 1 } as Space;

  describe('createSpaceType', () => {
    it('should create a space type', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPE_CREATED(
        createSpaceTypeDto.name,
        createSpaceTypeDto.space.id,
        expectedSpaceType,
      );

      jest.spyOn(spaceRepository, 'findOne').mockResolvedValueOnce(space);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(spaceTypesRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(spaceTypesRepository, 'create')
        .mockReturnValue(expectedSpaceType);
      jest
        .spyOn(spaceTypesRepository, 'save')
        .mockResolvedValueOnce(expectedSpaceType);

      expect(await service.createSpaceType(createSpaceTypeDto)).toEqual(
        expectedResult,
      );
    });

    it('should return space not found if space does not exist', async () => {
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_NOT_FOUND(
        createSpaceTypeDto.space.id,
      );

      expect(await service.createSpaceType(createSpaceTypeDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Space with ID ${createSpaceTypeDto.space.id} does not exist`,
      );
    });

    it('should return not found if user does not exist', async () => {
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValue(space);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const expectedResult = SPACE_RESPONSES.USER_NOT_FOUND(
        createSpaceTypeDto.createdBy.id,
      );

      expect(await service.createSpaceType(createSpaceTypeDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${createSpaceTypeDto.createdBy.id} does not exist`,
      );
    });

    it('should return space type already exists if the mapping already exists', async () => {
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValue(space);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockResolvedValue({} as SpaceTypes);

      expect(await service.createSpaceType(createSpaceTypeDto)).toEqual(
        SPACE_TYPES_RESPONSES.SPACE_TYPE_ALREADY_EXISTS(
          createSpaceTypeDto.name,
          createSpaceTypeDto.space.id,
        ),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Error creating space type: Space Type ${createSpaceTypeDto.name} with Space ID ${createSpaceTypeDto.space.id} already exists`,
      );
    });

    it('should handle errors during creation', async () => {
      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.createSpaceType(createSpaceTypeDto)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAllSpaceTypes', () => {
    it('should get all space type records', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPES_FETCHED([
        expectedSpaceType,
      ]);

      jest
        .spyOn(spaceTypesRepository, 'find')
        .mockResolvedValue([expectedSpaceType]);

      expect(await service.findAllSpaceTypes()).toEqual(expectedResult);
    });

    it('should return no space types if no space type found', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPES_NOT_FOUND();

      jest
        .spyOn(spaceTypesRepository, 'find')
        .mockResolvedValue([] as SpaceTypes[]);

      expect(await service.findAllSpaceTypes()).toEqual(expectedResult);
    });

    it('should handle errors during retrieval of all space types', async () => {
      jest
        .spyOn(spaceTypesRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findAllSpaceTypes()).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findSpaceTypeById', () => {
    it('should find space type by Id', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPE_FETCHED(
        expectedSpaceType,
        expectedSpaceType.id,
      );

      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockResolvedValue(expectedSpaceType);
      expect(await service.findSpaceTypeById(expectedSpaceType.id)).toEqual(
        expectedResult,
      );
    });

    it('should return no space type exists for the given id', async () => {
      jest.spyOn(spaceTypesRepository, 'findOne').mockResolvedValueOnce(null);
      const id = 1;
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPE_NOT_FOUND(id);

      expect(await service.findSpaceTypeById(id)).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Space Type with ID ${id} not found`,
      );
    });

    it('should handle errors during retrieval of a space type', async () => {
      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));
      const id = 1;
      await expect(service.findSpaceTypeById(id)).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateSpaceType', () => {
    it('should update space type details', async () => {
      const expectedResult = SPACE_TYPES_RESPONSES.SPACE_TYPE_UPDATED(
        expectedUpdatedSpaceType,
        expectedUpdatedSpaceType.id,
      );

      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockResolvedValue(expectedUpdatedSpaceType);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValue(space);

      jest
        .spyOn(spaceTypesRepository, 'save')
        .mockResolvedValue(expectedUpdatedSpaceType);

      expect(await service.updateSpaceType(1, updateSpaceTypeDto)).toEqual(
        expectedResult,
      );
    });

    it('should return space type not found if the space type does not exist', async () => {
      jest.spyOn(spaceTypesRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updateSpaceType(1, updateSpaceTypeDto);

      expect(result).toEqual(SPACE_TYPES_RESPONSES.SPACE_TYPE_NOT_FOUND(1));
    });

    it('should return user not found if user does not exist', async () => {
      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockResolvedValueOnce(expectedUpdatedSpaceType);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(null);

      const expectedResult = SPACE_RESPONSES.USER_NOT_FOUND(
        updateSpaceTypeDto.updatedBy.id,
      );

      expect(await service.updateSpaceType(1, updateSpaceTypeDto)).toEqual(
        expectedResult,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${updateSpaceTypeDto.updatedBy.id} does not exist`,
      );
    });

    it('should return space not found if the space does not exist', async () => {
      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockResolvedValue(expectedUpdatedSpaceType);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(spaceRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updateSpaceType(1, updateSpaceTypeDto);

      expect(result).toEqual(
        SPACE_TYPES_RESPONSES.SPACE_NOT_FOUND(updateSpaceTypeDto.space.id),
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Space with ID 1 does not exist`,
      );
    });

    it('should handle internal server errors', async () => {
      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockRejectedValue(new Error('Test Error'));

      await expect(
        service.updateSpaceType(1, updateSpaceTypeDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('removeSpaceType', () => {
    it('should log a message and return not found response if space type is not found', async () => {
      const spaceTypeId = 1;
      jest
        .spyOn(spaceTypesRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 0 });
      const loggerErrorSpy = jest.spyOn(logger, 'error');
      const expectedResponse =
        SPACE_TYPES_RESPONSES.SPACE_TYPE_NOT_FOUND(spaceTypeId);

      const result = await service.removeSpaceType(spaceTypeId);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Space Type with ID ${spaceTypeId} not found`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should log a message and return success response if space type is deleted successfully', async () => {
      const spaceTypeId = 1;
      jest
        .spyOn(spaceTypesRepository, 'delete')
        .mockResolvedValue({ raw: {}, affected: 1 });
      const loggerLogSpy = jest.spyOn(logger, 'log');
      const expectedResponse =
        SPACE_TYPES_RESPONSES.SPACE_TYPE_DELETED(spaceTypeId);

      const result = await service.removeSpaceType(spaceTypeId);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Space Type with ID ${spaceTypeId} deleted successfully`,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle internal server errors', async () => {
      jest
        .spyOn(spaceTypesRepository, 'delete')
        .mockRejectedValue(new Error('Test Error'));

      await expect(service.removeSpaceType(1)).rejects.toThrow(HttpException);
    });
  });
});
