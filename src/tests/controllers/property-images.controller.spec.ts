import { Test, TestingModule } from '@nestjs/testing';
import { PropertyImagesController } from 'src/main/controller/property-images.controller';
import { PropertyImagesService } from 'src/main/service/property-images.service';
import { CreatePropertyImagesRequestDto } from 'src/main/dto/requests/property-images/create-property-images-request.dto';
import { UpdatePropertyImageRequestDto } from 'src/main/dto/requests/property-images/update-property-image-request.dto';
import { PropertyImages } from 'src/main/entities/property_images.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthenticationService } from 'src/main/service/auth/authentication.service';
import { AuthGuard } from 'src/main/commons/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';
import {
  getAllowedExtensions,
  getMaxFileSize,
} from 'src/main/utils/image-file.utils';
import { PROPERTY_IMAGES_RESPONSES } from 'src/main/commons/constants/response-constants/property-images.constant';

describe('PropertyImagesController', () => {
  let controller: PropertyImagesController;
  let service: PropertyImagesService;

  const mockPropertyImagesService = {
    createPropertyImages: jest.fn(),
    findAllPropertyImages: jest.fn(),
    findPropertyImageById: jest.fn(),
    updatePropertyImageDetail: jest.fn(),
    deletePropertyImageById: jest.fn(),
  };

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

  const mockDto: CreatePropertyImagesRequestDto = {
    propertyImages: JSON.stringify([
      {
        property: { id: 1 },
        createdBy: { id: 1 },
        spaceType: { id: 1 },
        name: 'test-image',
        displayOrder: 1,
      },
    ]),
  };

  const propertyImageId = 1;
  const mockUpdateImageFile = {
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
  } as Express.Multer.File;

  const mockUpdateDto: UpdatePropertyImageRequestDto = {
    propertyImage: JSON.stringify({
      property: { id: 1 },
      updatedBy: { id: 1 },
      name: 'Bedroom 1',
      displayOrder: 1,
      spaceType: { id: 1 },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyImagesController],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        {
          provide: PropertyImagesService,
          useValue: mockPropertyImagesService,
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

    controller = module.get<PropertyImagesController>(PropertyImagesController);
    service = module.get<PropertyImagesService>(PropertyImagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPropertyImages', () => {
    it('should create property images successfully', async () => {
      const processedDto = [
        {
          property: { id: 1 },
          createdBy: { id: 1 },
          displayOrder: 1,
          name: 'test-image',
          spaceType: { id: 1 },
          imageFiles: mockFiles.imageFiles[0],
        },
      ] as unknown as PropertyImages[];

      const result =
        PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGES_CREATED(processedDto);

      jest.spyOn(service, 'createPropertyImages').mockResolvedValue(result);

      expect(await controller.createPropertyImages(mockFiles, mockDto)).toEqual(
        result,
      );
      expect(service.createPropertyImages).toHaveBeenCalledWith(processedDto);
    });

    it('should return an error response if the file size exceeds the maximum allowed size', async () => {
      const maxFileSize = getMaxFileSize();

      const mockOversizedFiles: { imageFiles?: Express.Multer.File[] } = {
        imageFiles: [
          {
            fieldname: 'imageFiles',
            originalname: 'test-image.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            buffer: Buffer.from('test'),
            size: maxFileSize + 1,
            stream: null,
            destination: '',
            filename: 'test-image.jpg',
            path: '',
          },
        ],
      };

      const expectedResponse =
        PROPERTY_IMAGES_RESPONSES.FILE_SIZE_TOO_LARGE(maxFileSize);

      const result = await controller.createPropertyImages(
        mockOversizedFiles,
        mockDto,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should return an error response if the file has an unsupported extension', async () => {
      const allowedExtensions = getAllowedExtensions();
      const mockUnsupportedFiles: { imageFiles?: Express.Multer.File[] } = {
        imageFiles: [
          {
            fieldname: 'imageFiles',
            originalname: 'test-image.txt',
            buffer: Buffer.from('test'),
            mimetype: 'text/plain',
            size: 1000,
            encoding: '',
            stream: null,
            destination: '',
            filename: '',
            path: '',
          },
        ],
      };

      const expectedResponse =
        PROPERTY_IMAGES_RESPONSES.UNSUPPORTED_FILE_EXTENSION(allowedExtensions);

      const result = await controller.createPropertyImages(
        mockUnsupportedFiles,
        mockDto,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should handle undefined imageFiles and not call the service', async () => {
      const mockFiles: { imageFiles?: Express.Multer.File[] } = {
        imageFiles: undefined,
      };

      const result = await controller.createPropertyImages(mockFiles, mockDto);
      expect(result).toEqual(
        PROPERTY_IMAGES_RESPONSES.MISMATCHED_DTO_AND_IMAGES(),
      );
    });

    it('should return an error response if no files are uploaded', async () => {
      const noFilesUploaded: { imageFiles?: Express.Multer.File[] } = {
        imageFiles: [],
      };

      const expectedResponse =
        PROPERTY_IMAGES_RESPONSES.MISMATCHED_DTO_AND_IMAGES();

      const result = await controller.createPropertyImages(
        noFilesUploaded,
        mockDto,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw a BAD_REQUEST HttpException when a SyntaxError is caught', async () => {
      const mockInvalidJsonDto: CreatePropertyImagesRequestDto = {
        propertyImages: 'invalid-json-string',
      };
      await expect(
        controller.createPropertyImages(mockFiles, mockInvalidJsonDto),
      ).rejects.toThrow(
        new HttpException(
          `Invalid request body format. Please provide a valid JSON string for propertyImages.`,
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an INTERNAL_SERVER_ERROR HttpException for generic errors', async () => {
      jest.spyOn(service, 'createPropertyImages').mockImplementation(() => {
        throw new Error('Generic error');
      });

      await expect(
        controller.createPropertyImages(mockFiles, mockDto),
      ).rejects.toThrow(
        new HttpException(
          'An error occurred while creating the property images',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getAllPropertyImages', () => {
    it('should return all property images', async () => {
      const result = PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGES_FETCHED([
        new PropertyImages(),
      ]);
      jest.spyOn(service, 'findAllPropertyImages').mockResolvedValue(result);

      expect(await controller.getAllPropertyImages()).toEqual(result);
    });

    it('should handle errors during retrieval', async () => {
      jest.spyOn(service, 'findAllPropertyImages').mockImplementation(() => {
        throw new HttpException(
          'An error occurred while retrieving all property images',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

      await expect(controller.getAllPropertyImages()).rejects.toThrow(
        new HttpException(
          'An error occurred while retrieving all property images',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getByPropertyImageId', () => {
    it('should return property image by ID', async () => {
      const id = 1;
      const result = PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_FETCHED(
        new PropertyImages(),
      );
      jest.spyOn(service, 'findPropertyImageById').mockResolvedValue(result);

      expect(await controller.getByPropertyImageId(id)).toEqual(result);
    });

    it('should handle errors during retrieval by ID', async () => {
      const id = 1;
      jest.spyOn(service, 'findPropertyImageById').mockImplementation(() => {
        throw new HttpException(
          'An error occurred while retrieving the property image',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

      await expect(controller.getByPropertyImageId(id)).rejects.toThrow(
        new HttpException(
          'An error occurred while retrieving the property image',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('updatePropertyImageId', () => {
    it('should update property image successfully', async () => {
      const result = PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_UPDATED(
        new PropertyImages(),
        propertyImageId,
      );
      jest
        .spyOn(service, 'updatePropertyImageDetail')
        .mockResolvedValue(result);
      expect(
        await controller.updatePropertyImageId(
          propertyImageId,
          mockUpdateImageFile,
          mockUpdateDto,
        ),
      ).toEqual(result);
    });

    it('should handle mismatched DTO and images error', async () => {
      const file = null;
      const expectedResponse =
        PROPERTY_IMAGES_RESPONSES.MISMATCHED_DTO_AND_IMAGES();
      const result = await controller.updatePropertyImageId(
        propertyImageId,
        file,
        mockUpdateDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should return an error response if the file size exceeds the maximum allowed size', async () => {
      const maxFileSize = getMaxFileSize();

      const mockOversizedUpdateImageFile = {
        fieldname: 'imageFiles',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: maxFileSize + 1,
        stream: null,
        destination: '',
        filename: 'test-image.jpg',
        path: '',
      } as Express.Multer.File;

      const expectedResponse =
        PROPERTY_IMAGES_RESPONSES.FILE_SIZE_TOO_LARGE(maxFileSize);

      const result = await controller.updatePropertyImageId(
        propertyImageId,
        mockOversizedUpdateImageFile,
        mockUpdateDto,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should return an error response if the file has an unsupported extension', async () => {
      const allowedExtensions = getAllowedExtensions();
      const mockUnsupportedFile = {
        fieldname: 'imageFiles',
        originalname: 'test-image.txt',
        buffer: Buffer.from('test'),
        mimetype: 'text/plain',
        size: 1000,
        encoding: '',
        stream: null,
        destination: '',
        filename: '',
        path: '',
      } as Express.Multer.File;

      const expectedResponse =
        PROPERTY_IMAGES_RESPONSES.UNSUPPORTED_FILE_EXTENSION(allowedExtensions);

      const result = await controller.updatePropertyImageId(
        propertyImageId,
        mockUnsupportedFile,
        mockUpdateDto,
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw a BAD_REQUEST HttpException when JSON is invalid', async () => {
      const mockDto: UpdatePropertyImageRequestDto = {
        propertyImage: 'invalid-json-string',
      };
      const mockFile = {} as Express.Multer.File;

      await expect(
        controller.updatePropertyImageId(1, mockFile, mockDto),
      ).rejects.toThrow(
        new HttpException(
          'Invalid request body format. Please provide a valid JSON string for propertyImages.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an INTERNAL_SERVER_ERROR HttpException for generic errors', async () => {
      jest
        .spyOn(service, 'updatePropertyImageDetail')
        .mockImplementation(() => {
          throw new Error('Generic error');
        });

      await expect(
        controller.updatePropertyImageId(1, mockUpdateImageFile, mockUpdateDto),
      ).rejects.toThrow(
        new HttpException(
          'An error occurred while updating the property image',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('deletePropertyImage', () => {
    it('should delete property image successfully', async () => {
      const id = 1;
      const result = PROPERTY_IMAGES_RESPONSES.PROPERTY_IMAGE_NOT_FOUND(id);
      jest.spyOn(service, 'deletePropertyImageById').mockResolvedValue(result);

      expect(await controller.deletePropertyImage(id)).toEqual(result);
    });

    it('should handle errors during deletion', async () => {
      const id = 1;
      jest.spyOn(service, 'deletePropertyImageById').mockImplementation(() => {
        throw new HttpException(
          'An error occurred while deleting the property image',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

      await expect(controller.deletePropertyImage(id)).rejects.toThrow(
        new HttpException(
          'An error occurred while deleting the property image',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
