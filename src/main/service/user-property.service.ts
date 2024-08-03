import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProperties } from 'entities/user-properties.entity';
import { LoggerService } from 'services/logger.service';
import { USER_PROPERTY_RESPONSES } from 'src/main/commons/constants/response-constants/user-property.response.constant';
import { CreateUserPropertyDTO } from '../dto/requests/create-user-property.dto';
import { UpdateUserPropertyDTO } from '../dto/requests/update-user-property.dto';

@Injectable()
export class UserPropertyService {
  constructor(
    @InjectRepository(UserProperties)
    private readonly userPropertyRepository: Repository<UserProperties>,
    private readonly logger: LoggerService,
  ) {}

  async createUserProperty(
    createUserPropertyDto: CreateUserPropertyDTO,
  ): Promise<object> {
    const existingUserProperty = await this.userPropertyRepository.findOne({
      where: {
        user: createUserPropertyDto.user,
        property: createUserPropertyDto.property,
        year: createUserPropertyDto.year,
      },
    });
    if (existingUserProperty) {
      this.logger.warn(
        `User property with user ID ${createUserPropertyDto.user.id}, property ID ${createUserPropertyDto.property.id}, and year ${createUserPropertyDto.year} already exists`,
      );
      return USER_PROPERTY_RESPONSES.USER_PROPERTY_ALREADY_EXISTS(
        createUserPropertyDto.user.id,
        createUserPropertyDto.property.id,
        createUserPropertyDto.year,
      );
    }

    const userProperty = new UserProperties();
    Object.assign(userProperty, createUserPropertyDto);

    const savedUserProperty =
      await this.userPropertyRepository.save(userProperty);
    this.logger.log(`User property created with ID ${savedUserProperty.id}`);
    return USER_PROPERTY_RESPONSES.USER_PROPERTY_CREATED(savedUserProperty);
  }

  async getUserProperties(): Promise<object> {
    this.logger.log('Fetching all user properties');
    const userProperties = await this.userPropertyRepository.find({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
    });
    if (userProperties.length === 0) {
      this.logger.warn('No user properties found');
      return USER_PROPERTY_RESPONSES.USER_PROPERTIES_NOT_FOUND();
    }
    return USER_PROPERTY_RESPONSES.USER_PROPERTIES_FETCHED(userProperties);
  }

  async getUserPropertyById(id: number): Promise<UserProperties> {
    this.logger.log(`Fetching user property with ID ${id}`);
    const userProperty = await this.userPropertyRepository.findOne({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
      where: { id },
    });
    if (!userProperty) {
      this.logger.warn(`User property with ID ${id} not found`);
      throw new NotFoundException(`User property with ID ${id} not found`);
    }
    return userProperty;
  }

  async updateUserProperty(
    id: number,
    updateUserPropertyDto: UpdateUserPropertyDTO,
  ): Promise<object> {
    const userProperty = await this.userPropertyRepository.findOne({
      where: { id },
    });
    if (!userProperty) {
      this.logger.warn(`User property with ID ${id} not found`);
      throw new NotFoundException(`User property with ID ${id} not found`);
    }
    Object.assign(userProperty, updateUserPropertyDto);
    const updatedUserProperty =
      await this.userPropertyRepository.save(userProperty);
    this.logger.log(`User property with ID ${id} updated`);
    return USER_PROPERTY_RESPONSES.USER_PROPERTY_UPDATED(updatedUserProperty);
  }

  async deleteUserProperty(id: number): Promise<object> {
    const result = await this.userPropertyRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`User property with ID ${id} not found`);
      throw new NotFoundException(`User property with ID ${id} not found`);
    }
    this.logger.log(`User property with ID ${id} deleted`);
    return USER_PROPERTY_RESPONSES.USER_PROPERTY_DELETED;
  }
}
