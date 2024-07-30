import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from 'src/controller/properties.controller';
import { Properties } from 'src/entities/properties.entity';
import { PropertiesService } from 'src/service/properties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Properties])],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
