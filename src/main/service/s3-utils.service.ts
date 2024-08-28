import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { LoggerService } from './logger.service';

@Injectable()
export class S3UtilsService {
  private readonly s3 = new S3();
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  constructor(private readonly logger: LoggerService) {}

  public async uploadFileToS3(
    folderName: string,
    fileName: string,
    fileBuffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    try {
      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: `${folderName}/${fileName}`,
          Body: fileBuffer,
          ContentType: mimetype,
          //   ACL: 'public-read',
        })
        .promise();
      return uploadResult.Location;
    } catch (err) {
      this.logger.error(
        `Error uploading file to S3 bucket. Code: ${err.code}, Message: ${err.message}`,
      );
      throw new HttpException(
        `Error uploading file to S3 bucket`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async extractS3Key(imageUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const urlParts = new URL(imageUrl);
      const s3Key = urlParts.pathname.substring(1); // Remove leading slash if present
      resolve(s3Key);
    });
  }

  public async checkIfObjectExistsInS3(
    s3Key: string,
  ): Promise<AWS.S3.HeadObjectOutput | null> {
    try {
      const response = await this.s3
        .headObject({
          Bucket: this.bucketName,
          Key: decodeURIComponent(s3Key),
        })
        .promise();
      return response;
    } catch (err) {
      if (err.code === 'NotFound') {
        this.logger.warn(`Image with key ${s3Key} not found in S3 bucket`);
        return null;
      }
      this.logger.error(`Error checking image existence: ${err.message}`);
      return null;
    }
  }

  public async deleteObjectFromS3(s3Key: string): Promise<boolean> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: decodeURIComponent(s3Key),
        })
        .promise();

      this.logger.log(
        `Image with key ${s3Key} successfully deleted from S3 bucket`,
      );
      return true;
    } catch (err) {
      this.logger.error(
        `Error deleting image from S3 bucket. Code: ${err.code}, Message: ${err.message}`,
      );
      throw new HttpException(
        `Error deleting image from S3 bucket`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
