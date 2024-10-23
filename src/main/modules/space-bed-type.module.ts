import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { UserModule } from './user.module';
import { SpaceBedTypeController } from '../controller/space-bed-type.controller';
import { SpaceBedTypeService } from '../service/space-bed-type.service';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { S3UtilsModule } from './s3-utils.module';
import { PropertySpaceBedModule } from './property-space-bed.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpaceBedType]),
    LoggerModule,
    UserModule,
    AuthenticationModule,
    S3UtilsModule,
    forwardRef(() => PropertySpaceBedModule),
  ],
  controllers: [SpaceBedTypeController],
  providers: [SpaceBedTypeService],
  exports: [SpaceBedTypeService],
})
export class SpaceBedTypeModule {}
