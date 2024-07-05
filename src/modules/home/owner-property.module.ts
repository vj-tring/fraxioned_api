import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entity/property.entity';
import { PropertyPhoto } from './entity/property-photo.entity';
import { PropertyService } from './owner-property.service';
import { PropertyController } from './owner-property.controller';
import { OwnerProperty } from './entity/owner-property.entity';
import { PropertyShareCount } from './entity/property-share-count.entity';
import { OwnerPropertyDetail } from './entity/owner-property-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      PropertyPhoto,
      OwnerProperty,
      PropertyShareCount,
      OwnerPropertyDetail,
    ]),
  ],
  providers: [PropertyService],
  controllers: [PropertyController],
})
export class OwnerPropertyModule {}
