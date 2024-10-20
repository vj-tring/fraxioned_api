import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from './logger.service';
import { CommonPropertiesResponseDto } from 'src/main/dto/responses/common-properties.dto';
import { CreatePropertiesResponseDto } from 'src/main/dto/responses/create-properties.dto';
import { UpdatePropertiesResponseDto } from 'src/main/dto/responses/update-properties.dto';
import { Property } from 'src/main/entities/property.entity';
import { Repository } from 'typeorm';
import { PropertyDetails } from '../entities/property-details.entity';
import { ComparePropertiesDto } from '../dto/ownerRez-properties.dto';
import axios from 'axios';
import { USER_PROPERTY_RESPONSES } from '../commons/constants/response-constants/user-property.constant';
import { PropertyWithDetailsResponseDto } from '../dto/responses/PropertyWithDetailsResponseDto.dto';
import { UserProperties } from '../entities/user-properties.entity';
import { UserPropertyWithDetailsResponseDto } from '../dto/responses/userPropertyResponse.dto';
import { PropertyWithDetails } from '../commons/interface/userPropertyDetails';
import { CreatePropertiesDto } from '../dto/requests/property/create-property.dto';
import { UpdatePropertiesDto } from '../dto/requests/property/update-properties.dto';
import { User } from '../entities/user.entity';
import { USER_RESPONSES } from '../commons/constants/response-constants/user.constant';
import { ApiResponse } from '../commons/response-body/common.responses';
import { PROPERTY_RESPONSES } from '../commons/constants/response-constants/property.constant';
import { S3UtilsService } from './s3-utils.service';
import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';
import { PropertySpaceService } from './property-space.service';
import { PropertyAdditionalImageService } from './property-additional-image.service';
import { PropertySpace } from '../entities/property-space.entity';
import { FindPropertyImagesData } from '../dto/responses/find-property-images-response.dto';
import { SpaceDTO } from '../dto/responses/space-response.dto';
import { PropertySpaceImageDTO } from '../dto/responses/property-space-image-response.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private propertyDetailsRepository: Repository<PropertyDetails>,
    @InjectRepository(UserProperties)
    private userPropertiesRepository: Repository<UserProperties>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly logger: LoggerService,
    private readonly s3UtilsService: S3UtilsService,
    @Inject(forwardRef(() => PropertySpaceService))
    private readonly propertySpaceService: PropertySpaceService,
    @Inject(forwardRef(() => PropertyAdditionalImageService))
    private readonly propertyAdditionalImageService: PropertyAdditionalImageService,
  ) {}
  private async shouldApplyPropertyNameFilter(
    userId: number,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
      select: { role: { id: true } },
    });
    return user?.role.id !== 1;
  }

  private async setPropertyName(
    property: Property,
    userId: number,
  ): Promise<Property> {
    const shouldApplyFilter = await this.shouldApplyPropertyNameFilter(userId);
    if (shouldApplyFilter && (property.id === 1 || property.id === 2)) {
      property.propertyName = 'Paradise Shores';
    }
    return property;
  }
  async createProperties(
    createPropertiesDto: CreatePropertiesDto,
  ): Promise<CreatePropertiesResponseDto> {
    try {
      const properties = this.propertiesRepository.create(createPropertiesDto);
      const savedProperties = await this.propertiesRepository.save(properties);
      return savedProperties;
    } catch (error) {
      throw error;
    }
  }

  async updatePropertiesById(
    id: number,
    updatePropertiesDto: UpdatePropertiesDto,
    mailBannerFile?: Express.Multer.File,
    coverImageFile?: Express.Multer.File,
  ): Promise<UpdatePropertiesResponseDto | object> {
    try {
      const existingProperty = await this.propertiesRepository.findOne({
        where: { id },
      });

      if (!existingProperty) {
        return PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(id);
      }

      if (mailBannerFile) {
        const folderName = `properties/${id}/mailBanners`;
        const fileExtension = mailBannerFile.originalname.split('.').pop();
        const fileName = `${existingProperty.propertyName} || ${id}-mailBanner.${fileExtension}`;
        let s3Key = '';
        let imageUrlLocation = existingProperty.mailBannerUrl;

        if (imageUrlLocation) {
          s3Key = await this.s3UtilsService.extractS3Key(imageUrlLocation);
        }

        if (s3Key) {
          if (decodeURIComponent(s3Key) != folderName + '/' + fileName) {
            const headObject =
              await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
            if (!headObject) {
              return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND_IN_AWS_S3(
                s3Key,
              );
            }
            await this.s3UtilsService.deleteObjectFromS3(s3Key);
          }
        }

        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          mailBannerFile.buffer,
          mailBannerFile.mimetype,
        );

        existingProperty.mailBannerUrl = imageUrlLocation;
      }

      if (coverImageFile) {
        const folderName = `properties/${id}/coverImages`;
        const fileExtension = coverImageFile.originalname.split('.').pop();
        const fileName = `${existingProperty.propertyName} || ${id}-coverImage.${fileExtension}`;
        let s3Key = '';
        let imageUrlLocation = existingProperty.coverImageUrl;

        if (imageUrlLocation) {
          s3Key = await this.s3UtilsService.extractS3Key(imageUrlLocation);
        }

        if (s3Key) {
          if (decodeURIComponent(s3Key) != folderName + '/' + fileName) {
            const headObject =
              await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
            if (!headObject) {
              return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND_IN_AWS_S3(
                s3Key,
              );
            }
            await this.s3UtilsService.deleteObjectFromS3(s3Key);
          }
        }

        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          coverImageFile.buffer,
          coverImageFile.mimetype,
        );

        existingProperty.coverImageUrl = imageUrlLocation;
      }

      const updatedProperties = this.propertiesRepository.merge(
        existingProperty,
        updatePropertiesDto,
      );

      await this.propertiesRepository.save(updatedProperties);
      return updatedProperties;
    } catch (error) {
      throw error;
    }
  }

  async deletePropertiesById(id: number): Promise<unknown> {
    try {
      const existingProperties = await this.propertiesRepository.findOne({
        where: { id },
      });

      if (!existingProperties) {
        return PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(id);
      }

      const imageUrls = [
        existingProperties.mailBannerUrl,
        existingProperties.coverImageUrl,
      ];

      for (const imageUrl of imageUrls) {
        if (imageUrl) {
          const s3Key = await this.s3UtilsService.extractS3Key(imageUrl);

          const headObject =
            await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
          if (headObject) {
            await this.s3UtilsService.deleteObjectFromS3(s3Key);
          } else {
            this.logger.warn(`Image not found in S3 for key: ${s3Key}`);
          }
        }
      }

      await this.propertiesRepository.remove(existingProperties);
      this.logger.log(`Properties with ID ${id} deleted successfully`);
      return PROPERTY_RESPONSES.PROPERTY_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting properties with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async compareAndUpdateProperties(): Promise<CommonPropertiesResponseDto[]> {
    const updatedProperties: CommonPropertiesResponseDto[] = [];
    const username = 'invoice@fraxioned.com';
    const password = 'pt_82y3fsmphj7gc0kze0u0p16gp2yn6pap';

    const response = await axios.get('https://api.ownerrez.com/v2/properties', {
      auth: {
        username,
        password,
      },
    });
    const externalProperties: ComparePropertiesDto = response.data;

    for (const item of externalProperties.items) {
      const existingProperty = await this.propertiesRepository.findOne({
        where: { ownerRezPropId: item.id },
      });

      if (existingProperty) {
        const existingPropertyDetails =
          await this.propertyDetailsRepository.findOne({
            where: { property: { id: existingProperty.id } },
          });

        if (existingPropertyDetails) {
          if (existingProperty.address !== item.address.street1) {
            existingProperty.address = item.address.street1;
          }
          if (existingProperty.city !== item.address.city) {
            existingProperty.city = item.address.city;
          }
          if (existingProperty.state !== item.address.state) {
            existingProperty.state = item.address.state;
          }
          if (existingProperty.country !== item.address.country) {
            existingProperty.country = item.address.country;
          }
          if (existingProperty.zipcode !== item.address.postal_code) {
            existingProperty.zipcode = item.address.postal_code;
          }
          if (existingProperty.latitude !== item.latitude) {
            existingProperty.latitude = item.latitude;
          }
          if (existingProperty.longitude !== item.longitude) {
            existingProperty.longitude = item.longitude;
          }
          if (existingProperty.displayOrder !== item.display_order) {
            existingProperty.displayOrder = item.display_order;
          }
          if (existingProperty.isActive !== item.active) {
            existingProperty.isActive = item.active;
          }
          if (existingPropertyDetails.noOfBathrooms !== item.bathrooms) {
            existingPropertyDetails.noOfBathrooms = item.bathrooms;
          }
          if (
            existingPropertyDetails.noOfBathroomsFull !== item.bathrooms_full
          ) {
            existingPropertyDetails.noOfBathroomsFull = item.bathrooms_full;
          }
          if (
            existingPropertyDetails.noOfBathroomsHalf !== item.bathrooms_half
          ) {
            existingPropertyDetails.noOfBathroomsHalf = item.bathrooms_half;
          }
          if (existingPropertyDetails.noOfBedrooms !== item.bedrooms) {
            existingPropertyDetails.noOfBedrooms = item.bedrooms;
          }
          if (existingPropertyDetails.noOfGuestsAllowed !== item.max_guests) {
            existingPropertyDetails.noOfGuestsAllowed = item.max_guests;
          }
          if (existingPropertyDetails.noOfPetsAllowed !== item.max_pets) {
            existingPropertyDetails.noOfPetsAllowed = item.max_pets;
          }

          await this.propertiesRepository.save(existingProperty);
          await this.propertyDetailsRepository.save(existingPropertyDetails);

          updatedProperties.push(existingProperty);
        }
      }
    }

    return updatedProperties;
  }

  async getAllProperties(
    userId: number,
  ): Promise<CommonPropertiesResponseDto[]> {
    try {
      const existingProperties = await this.propertiesRepository.find({
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
      if (existingProperties.length === 0) {
        throw new NotFoundException(`Properties not found`);
      }
      return Promise.all(
        existingProperties.map((property) =>
          this.setPropertyName(property, userId),
        ),
      );
    } catch (error) {
      throw error;
    }
  }

  async findPropertyById(id: number): Promise<Property | null> {
    return await this.propertiesRepository.findOne({
      where: { id },
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

  async handlePropertyNotFound(id: number): Promise<ApiResponse<null>> {
    this.logger.error(`Property with ID ${id} not found`);
    return PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(id);
  }

  async getPropertiesById(
    id: number,
    userId: number,
  ): Promise<CommonPropertiesResponseDto> {
    try {
      const existingProperties = await this.findPropertyById(id);
      if (!existingProperties) {
        throw new NotFoundException(`Properties with ID ${id} not found`);
      }
      return this.setPropertyName(existingProperties, userId);
    } catch (error) {
      throw error;
    }
  }

  async getPropertiesWithDetails(
    id?: number,
    requestedUser?: number,
  ): Promise<
    PropertyWithDetailsResponseDto | PropertyWithDetailsResponseDto[] | object
  > {
    try {
      if (id) {
        const property = await this.propertiesRepository.findOne({
          where: { id },
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

        if (!property) {
          return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(id);
        }

        const propertyDetails = await this.propertyDetailsRepository.findOne({
          where: { property: { id: id } },
        });

        if (!propertyDetails) {
          return USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(id);
        }

        const userProperties = await this.userPropertiesRepository.find({
          where: { property: { id: id } },
          relations: ['user'],
        });

        const uniqueUsers = new Map();
        userProperties.forEach((userProperty) => {
          if (!uniqueUsers.has(userProperty.user.id)) {
            uniqueUsers.set(userProperty.user.id, {
              user: userProperty.user,
              noOfShare: userProperty.noOfShare,
              acquisitionDate: userProperty.acquisitionDate,
            });
          }
        });

        const { id: propertyId, ...propertyWithoutId } =
          await this.setPropertyName(property, requestedUser);
        const { id: propertyDetailsId, ...propertyDetailsWithoutId } =
          propertyDetails;

        return {
          propertyId,
          propertyDetailsId,
          ...propertyWithoutId,
          ...propertyDetailsWithoutId,
          owners: Array.from(uniqueUsers.values()).map(
            ({ user, noOfShare, acquisitionDate }) => ({
              userId: user.id,
              noOfShare,
              acquisitionDate,
            }),
          ),
        };
      } else {
        const properties = await this.propertiesRepository.find({
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

        if (!properties.length) {
          return USER_PROPERTY_RESPONSES.PROPERTIES_NOT_FOUND;
        }

        const propertiesWithDetails = await Promise.all(
          properties.map(async (property) => {
            const propertyDetails =
              await this.propertyDetailsRepository.findOne({
                where: { property: { id: property.id } },
              });

            const userProperties = await this.userPropertiesRepository.find({
              where: { property: { id: property.id } },
              relations: ['user'],
            });

            const uniqueUsers = new Map();
            userProperties.forEach((userProperty) => {
              if (!uniqueUsers.has(userProperty.user.id)) {
                uniqueUsers.set(userProperty.user.id, {
                  user: userProperty.user,
                  noOfShare: userProperty.noOfShare,
                  acquisitionDate: userProperty.acquisitionDate,
                });
              }
            });

            property = await this.setPropertyName(property, requestedUser);

            if (!propertyDetails) {
              return {
                propertyId: property.id,
                propertyDetailsId: null,
                ...property,
                owners: Array.from(uniqueUsers.values()).map(
                  ({ user, noOfShare, acquisitionDate }) => ({
                    userId: user.id,
                    noOfShare,
                    acquisitionDate,
                  }),
                ),
              };
            }

            const { id: propertyId, ...propertyWithoutId } = property;
            const { id: propertyDetailsId, ...propertyDetailsWithoutId } =
              propertyDetails;

            return {
              propertyId,
              propertyDetailsId,
              ...propertyWithoutId,
              ...propertyDetailsWithoutId,
              owners: Array.from(uniqueUsers.values()).map(
                ({ user, noOfShare, acquisitionDate }) => ({
                  userId: user.id,
                  noOfShare,
                  acquisitionDate,
                }),
              ),
            };
          }),
        );
        return propertiesWithDetails;
      }
    } catch (error) {
      throw error;
    }
  }
  async getAllPropertiesWithDetailsByUser(
    userId: number,
    requestedUser: number,
  ): Promise<UserPropertyWithDetailsResponseDto[] | object> {
    try {
      const userExists = await this.userRepository.exists({
        where: { id: userId },
      });
      if (!userExists) {
        return USER_RESPONSES.USER_NOT_FOUND(userId);
      }

      const userProperties = await this.userPropertiesRepository.find({
        where: { user: { id: userId } },
        relations: ['property', 'user'],
      });

      if (!userProperties.length) {
        return USER_PROPERTY_RESPONSES.USER_PROPERTY_NOT_FOUND(userId);
      }

      const propertyMap = new Map<number, PropertyWithDetails>();

      await Promise.all(
        userProperties.map(async (userProperty) => {
          const propertyDetails = await this.propertyDetailsRepository.findOne({
            where: { property: { id: userProperty.property.id } },
          });

          userProperty.property = await this.setPropertyName(
            userProperty.property,
            requestedUser,
          );

          const {
            property: { id: propertyId, ...propertyWithoutId },
            ...userPropertyWithoutId
          } = userProperty;

          const { user, ...userPropertyWithoutUser } = userPropertyWithoutId;
          if (!user) {
            return USER_RESPONSES.USER_NOT_FOUND(user.id);
          }
          if (!propertyDetails) {
            if (!propertyMap.has(propertyId)) {
              propertyMap.set(propertyId, {
                propertyId,
                propertyDetailsId: null,
                ...propertyWithoutId,
                userProperties: [],
              });
            }
            propertyMap
              .get(propertyId)!
              .userProperties.push(userPropertyWithoutUser);
            return;
          }

          const { id: propertyDetailsId, ...propertyDetailsWithoutId } =
            propertyDetails;

          if (!propertyMap.has(propertyId)) {
            propertyMap.set(propertyId, {
              propertyId,
              propertyDetailsId,
              ...propertyWithoutId,
              ...propertyDetailsWithoutId,
              userProperties: [],
            });
          }
          propertyMap
            .get(propertyId)!
            .userProperties.push(userPropertyWithoutUser);
        }),
      );

      return Array.from(propertyMap.values());
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'An error occurred while fetching properties with details for the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyImagesByPropertyId(
    propertyId: number,
  ): Promise<ApiResponse<FindPropertyImagesData>> {
    try {
      const propertySpaces =
        await this.propertySpaceService.findAllPropertySpacesByPropertyId(
          propertyId,
        );

      if (propertySpaces.length === 0) {
        return this.propertySpaceService.handlePropertySpacesNotFound();
      }

      const additionalImages =
        await this.propertyAdditionalImageService.findAllPropertyAdditionalImagesByPropertyId(
          propertyId,
        );

      const groupedSpaces = this.groupPropertySpacesByType(propertySpaces);

      return PROPERTY_RESPONSES.PROPERTY_IMAGES_FETCHED(
        groupedSpaces,
        additionalImages,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property images for property ID ${propertyId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private groupPropertySpacesByType(
    propertySpaces: PropertySpace[],
  ): SpaceDTO[] {
    try {
      const spaceMap: Record<number, SpaceDTO> = {};

      propertySpaces.forEach((space) => {
        const spaceTypeId = space.space.id;

        if (!spaceMap[spaceTypeId]) {
          spaceMap[spaceTypeId] = {
            id: space.space.id,
            name: space.space.name,
            s3_url: space.space.s3_url,
            isBedTypeAllowed: space.space.isBedTypeAllowed,
            isBathroomTypeAllowed: space.space.isBathroomTypeAllowed,
            propertySpaces: [],
          };
        }

        const propertySpaceImages: PropertySpaceImageDTO[] =
          space.propertySpaceImages.map((image) => ({
            id: image.id,
            description: image.description,
            url: image.url,
            displayOrder: image.displayOrder,
          }));

        spaceMap[spaceTypeId].propertySpaces.push({
          id: space.id,
          instanceNumber: space.instanceNumber,
          spaceInstanceName: `${space.space.name} ${space.instanceNumber}`,
          propertySpaceImages,
        });
      });

      return Object.values(spaceMap);
    } catch (error) {
      this.logger.error(
        `Error while grouping property spaces by type: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while grouping property spaces by type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
