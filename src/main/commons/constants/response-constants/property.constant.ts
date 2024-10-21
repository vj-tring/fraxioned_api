import { HttpStatus } from '@nestjs/common';
import { PropertyAdditionalImageDTO } from 'src/main/dto/responses/property-additional-image-response.dto';
import { PropertySpaceDTO } from 'src/main/dto/responses/property-space-response.dto';
import { ApiResponse } from '../../response-body/common.responses';
import { FindPropertyImagesData } from 'src/main/dto/responses/find-property-images-response.dto';
import { PropertySpaceTotalsDTO } from 'src/main/dto/responses/property-space-totals-response.dto';

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
    groupedPropertySpaces: PropertySpaceDTO[],
    additionalImages: PropertyAdditionalImageDTO[],
    totals: PropertySpaceTotalsDTO,
  ): ApiResponse<FindPropertyImagesData> => ({
    success: true,
    message: 'Property images retrieved successfully',
    data: {
      propertySpace: groupedPropertySpaces,
      propertyAdditionalImages: additionalImages.map((image) => ({
        id: image.id,
        description: image.description,
        url: image.url,
        displayOrder: image.displayOrder,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt,
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
        updatedBy: {
          id:
            typeof image.updatedBy === 'number'
              ? image.updatedBy
              : image.updatedBy?.id,
        },
      })),
      totals,
    },
    statusCode: HttpStatus.OK,
  }),

  PROPERTY_SPACES_GROUPED: (
    groupedPropertySpaces: PropertySpaceDTO[],
    totals: PropertySpaceTotalsDTO,
  ): {
    success: boolean;
    message: string;
    data: {
      propertySpaces: PropertySpaceDTO[];
      totals: PropertySpaceTotalsDTO;
    };
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: 'Property spaces grouped successfully',
    data: {
      propertySpaces: groupedPropertySpaces,
      totals,
    },
    statusCode: HttpStatus.OK,
  }),
};
