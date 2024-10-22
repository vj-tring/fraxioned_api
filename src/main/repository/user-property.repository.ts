import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { UserProperties } from 'entities/user-properties.entity';

@Injectable()
export class UserPropertyRepository {
  constructor(
    @InjectRepository(UserProperties)
    private readonly repository: Repository<UserProperties>,
  ) {}

  create(userPropertyData: Partial<UserProperties>): UserProperties {
    return this.repository.create(userPropertyData);
  }
  async save(userProperty: UserProperties): Promise<UserProperties> {
    return this.repository.save(userProperty);
  }
  async saveUserProperties(
    userProperties: UserProperties[],
  ): Promise<UserProperties[]> {
    return this.repository.save(userProperties);
  }
  async findOne(
    userId: number,
    PropertyId: number,
    isActive: boolean,
  ): Promise<UserProperties> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        property: { id: PropertyId },
        isActive: isActive,
      },
    });
  }

  async findAllUserProperties(): Promise<UserProperties[]> {
    return this.repository.find({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
    });
  }

  async findUserPropertyById(id: number): Promise<UserProperties> {
    return this.repository.findOne({
      relations: ['user', 'property', 'createdBy', 'updatedBy'],
      select: {
        user: { id: true },
        property: { id: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
      where: { id },
    });
  }

  async findUserPropertiesForUpdate(
    userId: number,
    propertyId: number,
    currentYear: number,
  ): Promise<UserProperties[]> {
    return this.repository.find({
      where: {
        user: { id: userId },
        property: { id: propertyId },
        year: MoreThanOrEqual(currentYear),
        isActive: true,
      },
      relations: ['user', 'property', 'createdBy'],
    });
  }

  async updateUserProperties(
    existingUserProperties: UserProperties[],
    calculatedUserProperties: UserProperties[],
  ): Promise<UserProperties[]> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(existingUserProperties);
      const insertedProperties = await queryRunner.manager.save(
        UserProperties,
        calculatedUserProperties,
      );
      await queryRunner.commitTransaction();
      return insertedProperties;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserPropertiesByUserAndProperty(
    userId: number,
    propertyId: number,
  ): Promise<UserProperties[]> {
    return this.repository.find({
      where: {
        user: { id: userId },
        property: { id: propertyId },
        isActive: true,
      },
      relations: ['user', 'property'],
    });
  }

  async removePropertyForUserByUserId(
    userProperties: UserProperties[],
  ): Promise<UserProperties[]> {
    const updatedProperties = userProperties.map((userProperty) => {
      userProperty.isActive = false;
      return userProperty;
    });
    return this.repository.save(updatedProperties);
  }
}
