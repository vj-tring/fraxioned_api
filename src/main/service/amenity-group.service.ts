import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmenityGroup } from '../entities/amenity-group.entity';
import { CreateAmenityGroupDto } from '../dto/requests/amenity-group/create-amenity-group.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { AMENITY_GROUP_RESPONSES } from '../commons/constants/response-constants/amenity-group.constant';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { AMENITIES_RESPONSES } from '../commons/constants/response-constants/amenities.constant';
import { UpdateAmenityGroupDto } from '../dto/requests/amenity-group/update-amenity-group.dto';

@Injectable()
export class AmenityGroupService {
  constructor(
    @InjectRepository(AmenityGroup)
    private readonly amenityGroupRepository: Repository<AmenityGroup>,
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // @InjectRepository(SpaceTypes)
    // private readonly spaceTypesRepository: Repository<SpaceTypes>,
    private readonly logger: LoggerService,
  ) {}

  async findAmenityGroupByName(name: string): Promise<AmenityGroup | null> {
    return await this.amenityGroupRepository.findOne({
      where: { name },
    });
  }

  async findAllAmenityGroups(): Promise<AmenityGroup[] | null> {
    return await this.amenityGroupRepository.find({
      relations: ['createdBy', 'updatedBy'],
      select: {
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
      },
    });
  }

  async findAmenityGroupById(id: number): Promise<AmenityGroup | null> {
    return await this.amenityGroupRepository.findOne({
      relations: ['createdBy', 'updatedBy'],
      select: {
        createdBy: {
          id: true,
        },
        updatedBy: {
          id: true,
        },
      },
      where: { id },
    });
  }

  async findUserById(userId: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  async createAmenityGroup(
    createAmenityGroupDto: CreateAmenityGroupDto,
  ): Promise<ApiResponse<AmenityGroup>> {
    try {
      const existingAmenityGroup = await this.findAmenityGroupByName(
        createAmenityGroupDto.name,
      );
      if (existingAmenityGroup) {
        this.logger.error(
          `Error creating amenity group: Amenity Group ${createAmenityGroupDto.name} already exists`,
        );
        return AMENITY_GROUP_RESPONSES.AMENITY_GROUP_ALREADY_EXISTS(
          createAmenityGroupDto.name,
        );
      }

      const existingUser = await this.findUserById(
        createAmenityGroupDto.createdBy.id,
      );
      if (!existingUser) {
        this.logger.error(
          `User with ID ${createAmenityGroupDto.createdBy.id} does not exist`,
        );
        return AMENITIES_RESPONSES.USER_NOT_FOUND(
          createAmenityGroupDto.createdBy.id,
        );
      }

      const amenityGroup = this.amenityGroupRepository.create({
        ...createAmenityGroupDto,
      });
      const savedAmenityGroup =
        await this.amenityGroupRepository.save(amenityGroup);
      this.logger.log(
        `Amenity Group ${createAmenityGroupDto.name} created with ID ${savedAmenityGroup.id}`,
      );
      return AMENITY_GROUP_RESPONSES.AMENITY_GROUP_CREATED(savedAmenityGroup);
    } catch (error) {
      this.logger.error(
        `Error creating amenity group: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the amenity group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllAmenityGroups(): Promise<ApiResponse<AmenityGroup[]>> {
    try {
      const exisitngAmenityGroups = await this.findAllAmenityGroups();

      if (exisitngAmenityGroups.length === 0) {
        this.logger.log(`No amenity groups are available`);
        return AMENITY_GROUP_RESPONSES.AMENITY_GROUPS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${exisitngAmenityGroups.length} amenity groups successfully.`,
      );
      return AMENITY_GROUP_RESPONSES.AMENITY_GROUPS_FETCHED(
        exisitngAmenityGroups,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving amenity groups: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all amenity groups',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAmenityGroupById(id: number): Promise<ApiResponse<AmenityGroup>> {
    try {
      const existingAmenityGroup = await this.findAmenityGroupById(id);

      if (!existingAmenityGroup) {
        this.logger.error(`Amenity group with ID ${id} not found`);
        return AMENITY_GROUP_RESPONSES.AMENITY_GROUP_NOT_FOUND(id);
      }

      this.logger.log(`Amenity group with ID ${id} retrieved successfully`);
      return AMENITY_GROUP_RESPONSES.AMENITY_GROUP_FETCHED(
        existingAmenityGroup,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving amenity group with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the amenity group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAmenityGroupById(
    id: number,
    updateAmenityGroupDto: UpdateAmenityGroupDto,
  ): Promise<ApiResponse<AmenityGroup>> {
    try {
      const existingAmenityGroup = await this.findAmenityGroupById(id);

      if (!existingAmenityGroup) {
        this.logger.error(`Amenity group with ID ${id} not found`);
        return AMENITY_GROUP_RESPONSES.AMENITY_GROUP_NOT_FOUND(id);
      }

      const existingUser = await this.findUserById(
        updateAmenityGroupDto.updatedBy.id,
      );
      if (!existingUser) {
        this.logger.error(
          `User with ID ${updateAmenityGroupDto.updatedBy.id} does not exist`,
        );
        return AMENITIES_RESPONSES.USER_NOT_FOUND(
          updateAmenityGroupDto.updatedBy.id,
        );
      }

      Object.assign(existingAmenityGroup, updateAmenityGroupDto);
      const updatedAmenityGroup =
        await this.amenityGroupRepository.save(existingAmenityGroup);
      this.logger.log(`Amenity group with ID ${id} updated successfully`);
      return AMENITY_GROUP_RESPONSES.AMENITY_GROUP_UPDATED(updatedAmenityGroup);
    } catch (error) {
      this.logger.error(
        `Error updating amenity group with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the amenity group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAmenityGroupById(id: number): Promise<ApiResponse<AmenityGroup>> {
    try {
      // const spaceType = await this.spaceTypesRepository.findOne({
      //   where: { space: { id: id } },
      // });
      // if (spaceType) {
      //   this.logger.log(
      //     `Space ID ${id} exists and is mapped to space type, hence cannot be deleted.`,
      //   );
      //   return SPACE_RESPONSES.SPACE_FOREIGN_KEY_CONFLICT(id);
      // }
      const result = await this.amenityGroupRepository.delete(id);
      if (result.affected === 0) {
        this.logger.error(`Amenity group with ID ${id} not found`);
        return AMENITY_GROUP_RESPONSES.AMENITY_GROUP_NOT_FOUND(id);
      }
      this.logger.log(`Amenity group with ID ${id} deleted successfully`);
      return AMENITY_GROUP_RESPONSES.AMENITY_GROUP_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting amenity group with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the amenity group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
