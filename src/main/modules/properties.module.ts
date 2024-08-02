import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from 'src/main/controller/properties.controller';
import { Properties } from 'src/main/entities/properties.entity';
import { PropertiesService } from 'src/main/service/properties.service';
import { AuthenticationModule } from 'src/main/modules/authentication.module';

@Module({
  imports: [TypeOrmModule.forFeature([Properties]), AuthenticationModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
