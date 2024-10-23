import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './logger.module';
import { AuthenticationModule } from './authentication.module';
import { User } from '../entities/user.entity';
import { SpaceBathroomTypesController } from '../controller/space-bathroom-types.controller';
import { SpaceBathroomTypes } from '../entities/space-bathroom-types.entity';
import { SpaceBathroomTypesService } from '../service/space-bathroom-types.service';
import { UserModule } from './user.module';
import { S3UtilsModule } from './s3-utils.module';
import { PropertySpaceBathroomModule } from './property-space-bathroom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SpaceBathroomTypes]),
    UserModule,
    LoggerModule,
    AuthenticationModule,
    S3UtilsModule,
    PropertySpaceBathroomModule,
  ],
  controllers: [SpaceBathroomTypesController],
  providers: [SpaceBathroomTypesService],
})
export class SpaceBathroomTypesModule {}
