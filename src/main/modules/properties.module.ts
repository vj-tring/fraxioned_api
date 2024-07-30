import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from 'src/main/controller/properties.controller';
import { Properties } from 'src/main/entities/properties.entity';
import { PropertiesService } from 'src/main/service/properties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Properties])],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
