import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoggerService } from './logger.service';
import { Properties } from '../entities/properties.entity';
import { PropertyAmenities } from '../entities/property_amenities.entity';
import { Amenities } from '../entities/amenities.entity';

@Injectable()
export class PropertyAmenitiesService {
  constructor(
    @InjectRepository(PropertyAmenities)
    private readonly propertyAmenitiesRepository: Repository<PropertyAmenities>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Amenities)
    private readonly amenityRepository: Repository<Amenities>,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    private readonly logger: LoggerService,
  ) {}
}
