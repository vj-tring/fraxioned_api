import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entity/property.entity';
import { PropertyPhoto } from './entity/property-photo.entity';
import { OwnerPropertyService } from './owner-property.service';
import { OwnerPropertyController } from './owner-property.controller';
import { OwnerProperty } from './entity/owner-property.entity';
import { PropertyShareCount } from './entity/property-share-count.entity';
import { OwnerPropertyDetail } from './entity/owner-property-detail.entity';
import { PropertySeasonDate } from './entity/property-season-date.entity';
import { Season } from './entity/season.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      PropertyPhoto,
      OwnerProperty,
      PropertyShareCount,
      OwnerPropertyDetail,
      PropertySeasonDate,
      Season,
    ]),
  ],
  providers: [OwnerPropertyService],
  controllers: [OwnerPropertyController],
})
export class OwnerPropertyModule {}
