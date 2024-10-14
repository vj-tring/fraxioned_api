import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from 'src/main/entities/space.entity';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { SpaceController } from '../controller/space.controller';
import { SpaceService } from '../service/space.service';
import { UserModule } from './user.module';
import { PropertySpaceModule } from './property-space.module';
import { S3UtilsModule } from './s3-utils.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Space]),
    LoggerModule,
    AuthenticationModule,
    UserModule,
    forwardRef(() => PropertySpaceModule),
    S3UtilsModule,
  ],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
