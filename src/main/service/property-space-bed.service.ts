import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';
import { PropertySpaceBed } from '../entities/property-space-bed.entity';
import { CreatePropertySpaceBedDto } from '../dto/requests/property-space-bed/create-property-space-bed.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { UpdatePropertySpaceBedDto } from '../dto/requests/property-space-bed/update-property-space-bed.dto';
import { UserService } from './user.service';
import { SpaceBedTypeService } from './space-bed-type.service';
import { PropertySpaceService } from './property-space.service';
import { PROPERTY_SPACE_RESPONSES } from '../commons/constants/response-constants/property-space.constant';
import { USER_RESPONSES } from '../commons/constants/response-constants/user.constant';
import { CreateOrDeletePropertySpaceBedsDto } from '../dto/requests/property-space-bed/create-or-delete.dto';
import { SpaceBedType } from '../entities/space-bed-type.entity';
import { PROPERTY_SPACE_BED_RESPONSES } from '../commons/constants/response-constants/property-space-bed.constant';

@Injectable()
export class PropertySpaceBedService {
  constructor(
    @InjectRepository(PropertySpaceBed)
    private readonly propertySpaceBedRepository: Repository<PropertySpaceBed>,
    @InjectRepository(SpaceBedType)
    private readonly spaceBedTypeRepository: Repository<SpaceBedType>,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => PropertySpaceService))
    private readonly propertySpaceService: PropertySpaceService,
    @Inject(forwardRef(() => SpaceBedTypeService))
    private readonly spaceBedTypeService: SpaceBedTypeService,
  ) {}

  async handlePropertySpaceBedNotFound(id: number): Promise<ApiResponse<null>> {
    this.logger.error(`Property space bed with ID ${id} not found`);
    return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_NOT_FOUND(id);
  }

  async findAllPropertySpaceBeds(): Promise<PropertySpaceBed[] | null> {
    return await this.propertySpaceBedRepository.find({
      relations: ['propertySpace', 'spaceBedType', 'createdBy', 'updatedBy'],
      select: {
        propertySpace: { id: true },
        spaceBedType: { id: true, bedType: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
    });
  }

  async findPropertySpaceBedById(id: number): Promise<PropertySpaceBed | null> {
    return await this.propertySpaceBedRepository.findOne({
      relations: ['propertySpace', 'spaceBedType', 'createdBy', 'updatedBy'],
      where: { id },
      select: {
        propertySpace: { id: true },
        spaceBedType: { id: true, bedType: true },
        createdBy: { id: true },
        updatedBy: { id: true },
      },
    });
  }

  async findPropertySpaceBedBySpaceBedTypeId(
    id: number,
  ): Promise<PropertySpaceBed | null> {
    return await this.propertySpaceBedRepository.findOne({
      where: { spaceBedType: { id: id } },
    });
  }

  async createPropertySpaceBed(
    createPropertySpaceBedDto: CreatePropertySpaceBedDto,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const existingPropertySpace =
        await this.propertySpaceService.findPropertySpaceById(
          createPropertySpaceBedDto.propertySpace.id,
        );
      if (!existingPropertySpace) {
        return this.propertySpaceService.handlePropertySpaceNotFound(
          createPropertySpaceBedDto.propertySpace.id,
        );
      }

      const existingSpaceBedType =
        await this.spaceBedTypeService.findSpaceBedTypeById(
          createPropertySpaceBedDto.spaceBedType.id,
        );
      if (!existingSpaceBedType) {
        return this.spaceBedTypeService.handleSpaceBedTypeNotFound(
          createPropertySpaceBedDto.spaceBedType.id,
        );
      }

      const existingUser = await this.userService.findUserById(
        createPropertySpaceBedDto.createdBy.id,
      );
      if (!existingUser) {
        return this.userService.handleUserNotFound(
          createPropertySpaceBedDto.createdBy.id,
        );
      }

      const propertySpaceBed = this.propertySpaceBedRepository.create({
        ...createPropertySpaceBedDto,
        propertySpace: existingPropertySpace,
        spaceBedType: existingSpaceBedType,
        createdBy: existingUser,
      });
      const savedPropertySpaceBed =
        await this.propertySpaceBedRepository.save(propertySpaceBed);
      this.logger.log(
        `Property space bed created with ID ${savedPropertySpaceBed.id}`,
      );

      const createdPropertySpaceBedResponse = {
        id: savedPropertySpaceBed.id,
        propertySpaceId: savedPropertySpaceBed.propertySpace.id,
        spaceBedTypeId: savedPropertySpaceBed.spaceBedType.id,
        createdBy: savedPropertySpaceBed.createdBy.id,
        createdAt: savedPropertySpaceBed.createdAt,
        count: savedPropertySpaceBed.count,
      } as unknown as PropertySpaceBed;
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_CREATED(
        createdPropertySpaceBedResponse,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property space bed: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPropertySpaceBeds(): Promise<ApiResponse<PropertySpaceBed[]>> {
    try {
      const existingPropertySpaceBeds = await this.findAllPropertySpaceBeds();

      if (existingPropertySpaceBeds.length === 0) {
        this.logger.log(`No property space beds are available`);
        return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BEDS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${existingPropertySpaceBeds.length} property space beds successfully.`,
      );
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BEDS_FETCHED(
        existingPropertySpaceBeds,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space beds: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all property space beds',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPropertySpaceBedById(
    id: number,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const existingPropertySpaceBed = await this.findPropertySpaceBedById(id);

      if (!existingPropertySpaceBed) {
        return this.handlePropertySpaceBedNotFound(id);
      }

      this.logger.log(
        `Property space bed with ID ${id} retrieved successfully`,
      );
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_FETCHED(
        existingPropertySpaceBed,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property space bed with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllSpaceBedTypesByPropertySpaceId(
    propertySpaceId: number,
  ): Promise<ApiResponse<PropertySpaceBed[]>> {
    try {
      const propertySpaceBeds = await this.propertySpaceBedRepository.find({
        where: { propertySpace: { id: propertySpaceId } },
        relations: ['propertySpace', 'spaceBedType', 'createdBy', 'updatedBy'],
        select: {
          propertySpace: { id: true },
          spaceBedType: { id: true, bedType: true },
          createdBy: { id: true },
          updatedBy: { id: true },
        },
      });

      if (propertySpaceBeds.length === 0) {
        this.logger.log(
          `No space bed types found for property space ID ${propertySpaceId}`,
        );
        return PROPERTY_SPACE_BED_RESPONSES.SPACE_BED_TYPES_NOT_FOUND([]);
      }
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BEDS_FETCHED(
        propertySpaceBeds,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving space bed types for property space ID ${propertySpaceId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving space bed types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePropertySpaceBedById(
    id: number,
    updatePropertySpaceBedDto: UpdatePropertySpaceBedDto,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const existingPropertySpaceBed = await this.findPropertySpaceBedById(id);

      if (!existingPropertySpaceBed) {
        return this.handlePropertySpaceBedNotFound(id);
      }

      if (updatePropertySpaceBedDto.propertySpace) {
        const existingPropertySpace =
          await this.propertySpaceService.findPropertySpaceById(
            updatePropertySpaceBedDto.propertySpace.id,
          );
        if (!existingPropertySpace) {
          return this.propertySpaceService.handlePropertySpaceNotFound(
            updatePropertySpaceBedDto.propertySpace.id,
          );
        }
        existingPropertySpaceBed.propertySpace = existingPropertySpace;
      }

      if (updatePropertySpaceBedDto.spaceBedType) {
        const existingSpaceBedType =
          await this.spaceBedTypeService.findSpaceBedTypeById(
            updatePropertySpaceBedDto.spaceBedType.id,
          );
        if (!existingSpaceBedType) {
          return this.spaceBedTypeService.handleSpaceBedTypeNotFound(
            updatePropertySpaceBedDto.spaceBedType.id,
          );
        }
        existingPropertySpaceBed.spaceBedType = existingSpaceBedType;
      }

      if (updatePropertySpaceBedDto.updatedBy) {
        const existingUser = await this.userService.findUserById(
          updatePropertySpaceBedDto.updatedBy.id,
        );
        if (!existingUser) {
          return this.userService.handleUserNotFound(
            updatePropertySpaceBedDto.updatedBy.id,
          );
        }
        existingPropertySpaceBed.updatedBy = existingUser;
      }

      Object.assign(existingPropertySpaceBed, updatePropertySpaceBedDto);
      const updatedPropertySpaceBed =
        await this.propertySpaceBedRepository.save(existingPropertySpaceBed);
      this.logger.log(`Property space bed with ID ${id} updated successfully`);
      const updatedPropertySpaceBedResponse = {
        id: updatedPropertySpaceBed.id,
        propertySpaceId: updatedPropertySpaceBed.propertySpace.id,
        spaceBedTypeId: updatedPropertySpaceBed.spaceBedType.id,
        updatedBy: updatedPropertySpaceBed.updatedBy.id,
        updatedAt: updatedPropertySpaceBed.updatedAt,
        count: updatedPropertySpaceBed.count,
      } as unknown as PropertySpaceBed;
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_UPDATED(
        updatedPropertySpaceBedResponse,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property space bed with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertySpaceBedFromRepository(
    id: number,
  ): Promise<DeleteResult> {
    return this.propertySpaceBedRepository.delete(id);
  }
  async deletePropertySpaceBedByProperty(
    propertySpaceId: number,
  ): Promise<void> {
    await this.propertySpaceBedRepository.delete({
      propertySpace: { id: propertySpaceId },
    });
  }

  async deletePropertySpaceBedById(
    id: number,
  ): Promise<ApiResponse<PropertySpaceBed>> {
    try {
      const result = await this.deletePropertySpaceBedFromRepository(id);
      if (result.affected === 0) {
        this.logger.error(`Property space bed with ID ${id} not found`);
        return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_NOT_FOUND(id);
      }
      this.logger.log(`Property space bed with ID ${id} deleted successfully`);
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BED_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting property space bed with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property space bed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async createOrDeletePropertySpaceBeds(
    createOrDeletePropertySpaceBedsDto: CreateOrDeletePropertySpaceBedsDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertySpaceBed[];
    statusCode: HttpStatus;
  }> {
    try {
      const user = await this.userService.findUserById(
        createOrDeletePropertySpaceBedsDto.updatedBy.id,
      );
      if (!user) {
        this.logger.error(
          `User with ID ${createOrDeletePropertySpaceBedsDto.updatedBy.id} does not exist`,
        );
        return USER_RESPONSES.USER_NOT_FOUND();
      }

      const existingPropertySpace =
        await this.propertySpaceService.findPropertySpaceById(
          createOrDeletePropertySpaceBedsDto.propertySpace.id,
        );
      if (!existingPropertySpace) {
        this.logger.error(
          `Property space with ID ${createOrDeletePropertySpaceBedsDto.propertySpace.id} does not exist`,
        );
        return PROPERTY_SPACE_RESPONSES.PROPERTY_SPACE_NOT_FOUND(
          createOrDeletePropertySpaceBedsDto.propertySpace.id,
        );
      }

      const spaceBedTypeIds =
        createOrDeletePropertySpaceBedsDto.spaceBedTypes.map(
          (spaceBedType) => spaceBedType.spaceBedType.id,
        );

      const uniqueSpaceBedTypeIds = new Set(spaceBedTypeIds);
      if (uniqueSpaceBedTypeIds.size !== spaceBedTypeIds.length) {
        this.logger.error(
          `Duplicate spaceBedTypeId(s) found in the request for propertySpace with ID ${createOrDeletePropertySpaceBedsDto.propertySpace.id}`,
        );
        return PROPERTY_SPACE_BED_RESPONSES.DUPLICATE_SPACE_BED_TYPE();
      }

      const existingSpaceBedTypes = await this.spaceBedTypeRepository.findBy({
        id: In(spaceBedTypeIds),
      });

      const nonExistingIds = spaceBedTypeIds.filter(
        (id) =>
          !existingSpaceBedTypes.some((spaceBedType) => spaceBedType.id === id),
      );

      if (nonExistingIds.length > 0) {
        this.logger.error(
          `Space bed types with ID(s) ${nonExistingIds.join(', ')} do not exist`,
        );
        return PROPERTY_SPACE_BED_RESPONSES.SPACE_BED_TYPES_NOT_FOUND(
          nonExistingIds,
        );
      }

      const existingMappings = await this.propertySpaceBedRepository.find({
        where: {
          propertySpace: {
            id: createOrDeletePropertySpaceBedsDto.propertySpace.id,
          },
        },
        relations: ['spaceBedType', 'propertySpace'],
      });

      const existingSpaceBedTypeIds = existingMappings.map(
        (m) => m.spaceBedType.id,
      );

      const toUpdate = existingMappings.filter((mapping) =>
        spaceBedTypeIds.includes(mapping.spaceBedType.id),
      );

      const toCreate = createOrDeletePropertySpaceBedsDto.spaceBedTypes.filter(
        (spaceBedType) =>
          !existingSpaceBedTypeIds.includes(spaceBedType.spaceBedType.id),
      );

      const toDelete = existingMappings.filter(
        (mapping) => !spaceBedTypeIds.includes(mapping.spaceBedType.id),
      );

      if (toDelete.length > 0) {
        await this.propertySpaceBedRepository.remove(toDelete);
      }

      for (const mapping of toUpdate) {
        const newCount = createOrDeletePropertySpaceBedsDto.spaceBedTypes.find(
          (spaceBedType) =>
            spaceBedType.spaceBedType.id === mapping.spaceBedType.id,
        )?.count;

        if (newCount !== undefined) {
          mapping.count = newCount;
          mapping.updatedBy = user;
        }
      }

      await this.propertySpaceBedRepository.save(toUpdate);

      if (toCreate.length > 0) {
        const newMappings = toCreate.map((spaceBedTypeCount) => {
          const spaceBedType = existingSpaceBedTypes.find(
            (type) => type.id === spaceBedTypeCount.spaceBedType.id,
          );

          const propertySpaceBed = new PropertySpaceBed();
          propertySpaceBed.propertySpace = existingPropertySpace;
          propertySpaceBed.spaceBedType = spaceBedType;
          propertySpaceBed.count = spaceBedTypeCount.count;
          propertySpaceBed.createdBy = user;
          propertySpaceBed.updatedBy = user;

          return propertySpaceBed;
        });
        await this.propertySpaceBedRepository.save(newMappings);
      }

      this.logger.log(
        `Property space beds for the selected property space updated successfully`,
      );
      return PROPERTY_SPACE_BED_RESPONSES.PROPERTY_SPACE_BEDS_UPDATED();
    } catch (error) {
      this.logger.error(
        `Error creating property space beds: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creation or deletion of property space beds for the selected property space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
