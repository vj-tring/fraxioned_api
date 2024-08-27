import { Module } from '@nestjs/common';
import { LoggerModule } from './logger.module';
import { S3UtilsService } from '../service/s3-utils.service';

@Module({
  imports: [LoggerModule],
  providers: [S3UtilsService],
  exports: [S3UtilsService],
})
export class S3UtilsModule {}
