import { Test, TestingModule } from '@nestjs/testing';
import { S3UtilsService } from 'src/main/service/s3-utils.service';
import { LoggerService } from 'src/main/service/logger.service';
import AWS, { S3 } from 'aws-sdk';
import { HttpException } from '@nestjs/common';

jest.mock('aws-sdk', () => {
  const mockS3 = {
    upload: jest.fn(),
    headObject: jest.fn(),
    deleteObject: jest.fn(),
  };
  return { S3: jest.fn(() => mockS3) };
});

describe('S3UtilsService', () => {
  let service: S3UtilsService;
  let s3: S3;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3UtilsService,
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<S3UtilsService>(S3UtilsService);
    s3 = new S3();
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFileToS3', () => {
    it('should upload a file to S3 and return the file location', async () => {
      const mockUploadResult = {
        Location: 'https://s3.amazonaws.com/test/file.jpg',
      };

      const uploadSpy = jest.spyOn(s3, 'upload').mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockUploadResult),
      } as unknown as S3.ManagedUpload);

      const result = await service.uploadFileToS3(
        'folder',
        'file.jpg',
        Buffer.from('test'),
        'image/jpeg',
      );

      expect(result).toBe(mockUploadResult.Location);
      expect(uploadSpy).toHaveBeenCalledWith({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: 'folder/file.jpg',
        Body: Buffer.from('test'),
        ContentType: 'image/jpeg',
      });
    });

    it('should log an error and throw an HttpException if upload fails', async () => {
      const mockError = { code: 'MockError', message: 'Mock error message' };
      const uploadSpy = jest.spyOn(s3, 'upload').mockReturnValue({
        promise: jest.fn().mockRejectedValue(mockError),
      } as unknown as S3.ManagedUpload);

      const loggerSpy = jest.spyOn(loggerService, 'error');

      await expect(
        service.uploadFileToS3(
          'folder',
          'file.jpg',
          Buffer.from('test'),
          'image/jpeg',
        ),
      ).rejects.toThrow(HttpException);

      expect(uploadSpy).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        `Error uploading file to S3 bucket. Code: MockError, Message: Mock error message`,
      );
    });
  });

  describe('extractS3Key', () => {
    it('should extract the S3 key from a valid image URL', async () => {
      const imageUrl = 'https://s3.amazonaws.com/test-bucket/folder/file.jpg';
      const expectedS3Key = 'test-bucket/folder/file.jpg';

      const result = await service.extractS3Key(imageUrl);

      expect(result).toBe(expectedS3Key);
    });

    it('should handle URLs with a leading slash in the path', async () => {
      const imageUrl = 'https://s3.amazonaws.com/test-bucket//folder/file.jpg';
      const expectedS3Key = 'test-bucket//folder/file.jpg';

      const result = await service.extractS3Key(imageUrl);

      expect(result).toBe(expectedS3Key);
    });
  });

  describe('checkIfObjectExistsInS3', () => {
    it('should return S3 headObject response if object exists', async () => {
      const mockResponse = { ContentLength: 1234 } as AWS.S3.HeadObjectOutput;
      (s3.headObject as jest.Mock).mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await service.checkIfObjectExistsInS3('valid-s3-key');

      expect(result).toEqual(mockResponse);
      expect(s3.headObject).toHaveBeenCalledWith({
        Bucket: service['bucketName'],
        Key: 'valid-s3-key',
      });
    });

    it('should return null and log a warning if object does not exist', async () => {
      const loggerSpy = jest.spyOn(loggerService, 'warn');
      (s3.headObject as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue({
          code: 'NotFound',
        }),
      });

      const result = await service.checkIfObjectExistsInS3('invalid-s3-key');

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(
        `Image with key invalid-s3-key not found in S3 bucket`,
      );
    });

    it('should return null and log an error for other errors', async () => {
      const loggerSpy = jest.spyOn(loggerService, 'error');
      (s3.headObject as jest.Mock).mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('Some S3 error')),
      });

      const result = await service.checkIfObjectExistsInS3('s3-key-with-error');

      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(
        `Error checking image existence: Some S3 error`,
      );
    });
  });

  describe('deleteObjectFromS3', () => {
    it('should delete an object from S3 and return true', async () => {
      const deleteSpy = jest.spyOn(s3, 'deleteObject').mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      } as unknown as AWS.Request<S3.DeleteObjectOutput, AWS.AWSError>);

      const loggerSpy = jest.spyOn(loggerService, 'log');

      const result = await service.deleteObjectFromS3('valid-s3-key');

      expect(result).toBe(true);
      expect(deleteSpy).toHaveBeenCalledWith({
        Bucket: service['bucketName'],
        Key: 'valid-s3-key',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Image with key valid-s3-key successfully deleted from S3 bucket`,
      );
    });

    it('should log an error and throw an HttpException if deletion fails', async () => {
      const mockError = { code: 'MockError', message: 'Mock error message' };
      const deleteSpy = jest.spyOn(s3, 'deleteObject').mockReturnValue({
        promise: jest.fn().mockRejectedValue(mockError),
      } as unknown as AWS.Request<S3.DeleteObjectOutput, AWS.AWSError>);

      const loggerSpy = jest.spyOn(loggerService, 'error');

      await expect(
        service.deleteObjectFromS3('invalid-s3-key'),
      ).rejects.toThrow(HttpException);
      expect(deleteSpy).toHaveBeenCalledWith({
        Bucket: service['bucketName'],
        Key: 'invalid-s3-key',
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Error deleting image from S3 bucket. Code: MockError, Message: Mock error message`,
      );
    });
  });
});
