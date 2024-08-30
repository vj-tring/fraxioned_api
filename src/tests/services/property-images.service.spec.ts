import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropertyImagesService } from 'src/main/service/property-images.service';
import { PropertyImages } from 'src/main/entities/property_images.entity';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';
import { Space } from 'src/main/entities/space.entity';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { S3UtilsService } from 'src/main/service/s3-utils.service';
import { LoggerService } from 'src/main/service/logger.service';
import { CreatePropertyImagesDto } from 'src/main/dto/requests/property-images/create-property-images.dto';
// import { UpdatePropertyImageDto } from 'src/main/dto/requests/property-images/update-property-image.dto';
import { HttpException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PROPERTY_IMAGES_RESPONSES } from 'src/main/commons/constants/response-constants/property-images.constant';

describe('PropertyImagesService', () => {
  let service: PropertyImagesService;
  let propertyImagesRepository: Repository<PropertyImages>;
  let propertiesRepository: Repository<Property>;
  let userRepository: Repository<User>;
  let spaceTypesRepository: Repository<SpaceTypes>;
  let s3UtilsService: S3UtilsService;
  let logger: LoggerService;

  const mockFiles: { imageFiles?: Express.Multer.File[] } = {
    imageFiles: [
      {
        fieldname: 'imageFiles',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 2771662,
        stream: null,
        destination: '',
        filename: 'test-image.jpg',
        path: '',
      },
    ],
  };

  const createPropertyImagesDtos: CreatePropertyImagesDto[] = [
    {
      property: { id: 1 } as Property,
      createdBy: { id: 1 } as User,
      displayOrder: 1,
      name: 'test-image',
      spaceType: { id: 1 } as SpaceTypes,
      imageFiles: mockFiles.imageFiles[0],
    },
  ];

  const property = { id: 1, propertyName: 'Test property' } as Property;
  const user = { id: 1 } as User;
  const spaceType = {
    id: 1,
    name: 'Test Space Type Name',
    space: {
      id: 1,
      name: 'Test Space Name',
    },
  } as SpaceTypes;
  const imageUrl = 'https://s3.bucket/test-image.jpg';
  const savedImage = {
    id: 1,
    property: property,
    createdBy: user,
    displayOrder: createPropertyImagesDtos[0].displayOrder,
    imageName: createPropertyImagesDtos[0].name,
    spaceType: spaceType[0],
    imageUrl: imageUrl,
  } as PropertyImages;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        PropertyImagesService,
        {
          provide: getRepositoryToken(PropertyImages),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Space),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SpaceTypes),
          useClass: Repository,
        },
        {
          provide: S3UtilsService,
          useValue: {
            uploadFileToS3: jest.fn(),
          },
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

    service = module.get<PropertyImagesService>(PropertyImagesService);
    propertyImagesRepository = module.get<Repository<PropertyImages>>(
      getRepositoryToken(PropertyImages),
    );
    propertiesRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    spaceTypesRepository = module.get<Repository<SpaceTypes>>(
      getRepositoryToken(SpaceTypes),
    );
    s3UtilsService = module.get<S3UtilsService>(S3UtilsService);
    logger = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPropertyImages', () => {
    it('should successfully create property images', async () => {
      jest
        .spyOn(propertiesRepository, 'findOne')
        .mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest
        .spyOn(spaceTypesRepository, 'find')
        .mockResolvedValueOnce([spaceType]);
      jest
        .spyOn(spaceTypesRepository, 'findOne')
        .mockResolvedValueOnce(spaceType);
      jest
        .spyOn(s3UtilsService, 'uploadFileToS3')
        .mockResolvedValueOnce(imageUrl);
      jest
        .spyOn(propertyImagesRepository, 'create')
        .mockReturnValue(savedImage);
      jest
        .spyOn(propertyImagesRepository, 'save')
        .mockResolvedValue(savedImage);

      const result = await service.createPropertyImages(
        createPropertyImagesDtos,
      );

      const expectedResult = PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGES_CREATED(
        createPropertyImagesDtos.length,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle property not found', async () => {
      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.createPropertyImages(
        createPropertyImagesDtos,
      );
      const expectedResult = PROPERTY_IMAGES_RESPONSES.PROPERTY_NOT_FOUND(
        property.id,
      );
      expect(result).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Property with ID ${property.id} does not exist`,
      );
    });

    it('should return not found if user does not exist', async () => {
      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.createPropertyImages(
        createPropertyImagesDtos,
      );
      const expectedResult = PROPERTY_IMAGES_RESPONSES.USER_NOT_FOUND(user.id);

      expect(result).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `User with ID ${user.id} does not exist`,
      );
    });

    it('should handle invalid space type IDs', async () => {
      jest.spyOn(propertiesRepository, 'findOne').mockResolvedValue(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(spaceTypesRepository, 'find').mockResolvedValue([]);

      const result = await service.createPropertyImages(
        createPropertyImagesDtos,
      );

      const expectedResult =
        PROPERTY_IMAGES_RESPONSES.MULTIPLE_SPACE_TYPES_NOT_FOUND(
          createPropertyImagesDtos.map((dto) => dto.spaceType.id),
        );

      expect(result).toEqual(expectedResult);
      expect(logger.error).toHaveBeenCalledWith(
        `Invalid Space Type IDs: ${createPropertyImagesDtos.map((dto) => dto.spaceType.id).join(', ')}`,
      );
    });

    it('should handle errors during creation', async () => {
      jest
        .spyOn(propertyImagesRepository, 'findOne')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.createPropertyImages(createPropertyImagesDtos),
      ).rejects.toThrow(HttpException);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('findAllPropertyImages', () => {
    it('should return all property images', async () => {
      jest
        .spyOn(propertyImagesRepository, 'find')
        .mockResolvedValue([savedImage]);

      const result = await service.findAllPropertyImages();
      const expectedResult = PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGES_FETCHED([
        savedImage,
      ]);
      expect(result).toEqual(expectedResult);
    });

    it('should return no property images found', async () => {
      const propertyImages: PropertyImages[] = [];
      const expectedResult =
        PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGES_NOT_FOUND();

      jest
        .spyOn(propertyImagesRepository, 'find')
        .mockResolvedValue(propertyImages);

      expect(await service.findAllPropertyImages()).toEqual(expectedResult);
    });

    it('should handle errors during retrieval of all property images', async () => {
      jest
        .spyOn(propertyImagesRepository, 'find')
        .mockRejectedValueOnce(new Error('DB Error'));

      await expect(service.findAllPropertyImages()).rejects.toThrow(
        HttpException,
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
