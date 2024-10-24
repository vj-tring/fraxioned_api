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
import { Between, Repository } from 'typeorm';
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
import { PropertySpaceService } from './property-space.service';
import { PropertyAdditionalImageService } from './property-additional-image.service';
import { PropertySpace } from '../entities/property-space.entity';
import { FindPropertyImagesData } from '../dto/responses/find-property-images-response.dto';
import { PropertySpaceImageDTO } from '../dto/responses/property-space-image-response.dto';
import { PropertySpaceDTO } from '../dto/responses/property-space-response.dto';
import { PropertySpaceTotalsDTO } from '../dto/responses/property-space-totals-response.dto';
import { PropertySpaceAmenitiesService } from './property-space-amenity.service';

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
    private readonly propertySpaceAmenitiesService: PropertySpaceAmenitiesService,
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

  async processFileUpload(
    currentUrl: string,
    file: Express.Multer.File | undefined,
    folder: string,
    propertyId: number,
    propertyName: string,
    fileType: string,
  ): Promise<string> {
    try {
      let imageUrlLocation = await this.s3UtilsService.handleS3KeyAndImageUrl(
        currentUrl,
        !!file,
      );

      if (file) {
        const folderName = `properties/${propertyId}/${folder}`;
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${propertyName} || ${propertyId}-${fileType}.${fileExtension}`;
        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          file.buffer,
          file.mimetype,
        );
      }

      return imageUrlLocation;
    } catch (error) {
      console.error(`Error processing file upload for ${fileType}:`, error);
      throw new Error(`File upload failed for ${fileType}`);
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

      Object.assign(existingProperty, updatePropertiesDto);

      existingProperty.mailBannerUrl = await this.processFileUpload(
        existingProperty.mailBannerUrl,
        mailBannerFile,
        'mailBanners',
        id,
        existingProperty.propertyName,
        'mailBanner',
      );

      existingProperty.coverImageUrl = await this.processFileUpload(
        existingProperty.coverImageUrl,
        coverImageFile,
        'coverImages',
        id,
        existingProperty.propertyName,
        'coverImage',
      );

      const updatedProperties =
        await this.propertiesRepository.save(existingProperty);
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
        await this.s3UtilsService.handleS3KeyAndImageUrl(imageUrl, true);
      }

      await this.propertiesRepository.delete(id);
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
          relations: ['property'],
        });

        if (!propertyDetails) {
          return USER_PROPERTY_RESPONSES.PROPERTY_DETAIL_NOT_FOUND(id);
        }

        const userProperties = await this.userPropertiesRepository.find({
          where: {
            property: { id: id },
            isActive: true,
          },
          relations: ['user', 'property'],
        });

        const uniqueUsers = new Map();
        userProperties.forEach((userProperty) => {
          if (userProperty.user && !uniqueUsers.has(userProperty.user.id)) {
            uniqueUsers.set(userProperty.user.id, {
              user: userProperty.user,
              noOfShare: userProperty.noOfShare,
              acquisitionDate: userProperty.acquisitionDate,
            });
          }
        });

        const { id: propertyId, ...propertyWithoutId } =
          await this.setPropertyName(property, requestedUser);
        const {
          id: propertyDetailsId,
          property: removedProperty,
          ...propertyDetailsWithoutId
        } = propertyDetails;

        this.logger.log(
          `Removed property from propertyDetails for response structure ${removedProperty}`,
        );

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
                relations: ['property'],
              });

            const userProperties = await this.userPropertiesRepository.find({
              where: {
                property: { id: property.id },
                isActive: true,
              },
              relations: ['user', 'property'],
            });

            const uniqueUsers = new Map();
            userProperties.forEach((userProperty) => {
              if (userProperty.user && !uniqueUsers.has(userProperty.user.id)) {
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
                    userId: user?.id,
                    noOfShare,
                    acquisitionDate,
                  }),
                ),
              };
            }

            const { id: propertyId, ...propertyWithoutId } = property;
            const {
              id: propertyDetailsId,
              property: removedProperty,
              ...propertyDetailsWithoutId
            } = propertyDetails;

            this.logger.log(
              `Removed property from propertyDetails for response structure ${removedProperty}`,
            );
            return {
              propertyId,
              propertyDetailsId,
              ...propertyWithoutId,
              ...propertyDetailsWithoutId,
              owners: Array.from(uniqueUsers.values()).map(
                ({ user, noOfShare, acquisitionDate }) => ({
                  userId: user?.id,
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
      this.logger.error(`Error in getPropertiesWithDetails: ${error.message}`);
      throw new HttpException(
        'An error occurred while fetching properties with details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

      const currentDate = new Date();

      let effectiveYear = currentDate.getFullYear();
      if (currentDate.getMonth() === 11 && currentDate.getDate() === 31) {
        effectiveYear += 1;
      }

      const startYear = effectiveYear;
      const endYear = effectiveYear + 2;

      this.logger.log(
        `Fetching properties for years between ${startYear} and ${endYear}`,
      );

      const userProperties = await this.userPropertiesRepository.find({
        where: {
          user: { id: userId },
          isActive: true,
          year: Between(startYear, endYear),
        },
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

      const groupedPropertySpacesResponse =
        await this.groupPropertySpacesByType(propertySpaces);

      const { propertySpaces: groupedPropertySpaces, totals } =
        groupedPropertySpacesResponse.data;

      return PROPERTY_RESPONSES.PROPERTY_IMAGES_FETCHED(
        groupedPropertySpaces,
        additionalImages,
        totals,
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

  async groupPropertySpacesByType(propertySpaces: PropertySpace[]): Promise<
    ApiResponse<{
      propertySpaces: PropertySpaceDTO[];
      totals: PropertySpaceTotalsDTO;
    }>
  > {
    try {
      let totalNumberOfBedrooms = 0;
      let totalNumberOfBathrooms = 0;
      let totalNumberOfBeds = 0;

      const groupedPropertySpaces: PropertySpaceDTO[] = await Promise.all(
        propertySpaces.map(async (propertySpace) => {
          let propertySpaceImages: PropertySpaceImageDTO[] =
            propertySpace.propertySpaceImages.map((image) => ({
              id: image.id,
              description: image.description,
              url: image.url,
              displayOrder: image.displayOrder,
            }));

          if (propertySpaceImages.length === 0) {
            const defaultImageUrl = propertySpace.space.s3_url;
            propertySpaceImages = [
              {
                id: 0,
                description: 'Default Image',
                url: defaultImageUrl,
                displayOrder: 0,
              },
            ];
          }

          const propertySpaceBeds = propertySpace.propertySpaceBeds
            .filter((bed) => bed.count > 0)
            .map((bed) => {
              totalNumberOfBeds += bed.count;
              return {
                propertySpaceBedId: bed.id,
                bedType: bed.spaceBedType.bedType,
                count: bed.count,
                s3_image_url: bed.spaceBedType.s3_url,
                spaceBedTypeId: bed.spaceBedType.id,
              };
            })
            .sort((a, b) => a.spaceBedTypeId - b.spaceBedTypeId);

          const propertySpaceBathrooms = propertySpace.propertySpaceBathrooms
            .filter((bathroom) => bathroom.count > 0)
            .map((bathroom) => {
              totalNumberOfBathrooms +=
                bathroom.count * bathroom.spaceBathroomType.countValue;
              return {
                propertySpaceBathroomId: bathroom.id,
                bathroomType: bathroom.spaceBathroomType.name,
                count: bathroom.count,
                s3_image_url: bathroom.spaceBathroomType.s3_url,
                countValue: bathroom.spaceBathroomType.countValue,
                spaceBathroomTypeId: bathroom.spaceBathroomType.id,
              };
            })
            .sort((a, b) => a.spaceBathroomTypeId - b.spaceBathroomTypeId);

          if (propertySpace.space.name.toLowerCase() === 'bedroom') {
            totalNumberOfBedrooms++;
          }

          const groupedAmenities =
            await this.propertySpaceAmenitiesService.groupAmenitiesByGroup(
              propertySpace.propertySpaceAmenities,
            );

          return {
            id: propertySpace.id,
            isBedType: propertySpace.space.isBedTypeAllowed,
            isBathroomType: propertySpace.space.isBathroomTypeAllowed,
            propertySpaceName: `${propertySpace.space.name} ${propertySpace.instanceNumber}`,
            propertySpaceInstanceNumber: propertySpace.instanceNumber,
            spaceId: propertySpace.space.id,
            spaceName: propertySpace.space.name,
            propertySpaceImages,
            propertySpaceBeds,
            propertySpaceBathrooms,
            amenityGroups: groupedAmenities.amenityGroup,
          };
        }),
      );

      groupedPropertySpaces.sort((a, b) => {
        if (a.spaceId === b.spaceId) {
          return a.propertySpaceInstanceNumber - b.propertySpaceInstanceNumber;
        }
        return a.spaceId - b.spaceId;
      });

      const totals = new PropertySpaceTotalsDTO(
        totalNumberOfBedrooms,
        totalNumberOfBathrooms,
        totalNumberOfBeds,
      );

      return PROPERTY_RESPONSES.PROPERTY_SPACES_GROUPED(
        groupedPropertySpaces,
        totals,
      );
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
