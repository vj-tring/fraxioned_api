import { HttpStatus } from '@nestjs/common';
import { PropertyAdditionalImageDTO } from 'src/main/dto/responses/property-additional-image-response.dto';
import { SpaceDTO } from 'src/main/dto/responses/space-response.dto';

export const PROPERTY_RESPONSES = {
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property with ID ${propertyId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_CREATED: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: true,
    message: `Property with ID ${propertyId} created successfully`,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_UPDATED: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: true,
    message: `Property with ID ${propertyId} updated successfully`,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_DELETED: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: true,
    message: `Property with ID ${propertyId} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),

  PROPERTY_IMAGES_FETCHED: (
    groupedSpaces: SpaceDTO[],
    additionalImages: PropertyAdditionalImageDTO[],
  ): {
    success: boolean;
    message: string;
    data: {
      space: SpaceDTO[];
      propertyAdditionalImages: PropertyAdditionalImageDTO[];
    };
    statusCode: number;
  } => ({
    success: true,
    message: 'Property images retrieved successfully',
    data: {
      space: groupedSpaces,
      propertyAdditionalImages: additionalImages.map((image) => ({
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
        id: image.id,
        description: image.description,
        url: image.url,
        displayOrder: image.displayOrder,
        property: {
          id: image.property.id,
          propertyName: image.property.propertyName,
        },
        createdBy: {
          id:
            typeof image.createdBy === 'number'
              ? image.createdBy
              : image.createdBy.id,
        },
        updatedBy:
          typeof image.updatedBy === 'number'
            ? image.updatedBy
            : image.updatedBy?.id,
      })),
    },
    statusCode: HttpStatus.OK,
  }),
};
