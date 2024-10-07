import { HttpStatus } from '@nestjs/common';
import { PropertySpace } from 'src/main/entities/property-space.entity';

export const PROPERTY_SPACE_RESPONSES = {
  PROPERTY_SPACE_ALREADY_EXISTS: (
    propertyName: string,
    spaceName: string,
    instanceNumber: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property ${propertyName} with Space ${spaceName} ${instanceNumber} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  PROPERTY_SPACE_CREATED: (
    savedPropertySpace: PropertySpace,
    spaceName: string,
    propertyName: string,
  ): {
    success: boolean;
    message: string;
    data: PropertySpace;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Space ${spaceName} ${savedPropertySpace.instanceNumber} for Property ${propertyName} created`,
    data: savedPropertySpace,
    statusCode: HttpStatus.CREATED,
  }),
  //   AMENITY_GROUPS_NOT_FOUND: (): {
  //     success: boolean;
  //     message: string;
  //     data?: AmenityGroup[];
  //     statusCode: number;
  //   } => ({
  //     success: true,
  //     message: 'No amenity groups are available',
  //     data: [],
  //     statusCode: HttpStatus.OK,
  //   }),
  //   AMENITY_GROUPS_FETCHED: (
  //     amenityGroups: AmenityGroup[],
  //   ): {
  //     success: boolean;
  //     message: string;
  //     data?: AmenityGroup[];
  //     statusCode: number;
  //   } => ({
  //     success: true,
  //     message: `Retrieved ${amenityGroups.length} amenity groups successfully.`,
  //     data: amenityGroups,
  //     statusCode: HttpStatus.OK,
  //   }),

  //   AMENITY_GROUP_NOT_FOUND: (
  //     id: number,
  //   ): {
  //     success: boolean;
  //     message: string;
  //     statusCode: number;
  //   } => ({
  //     success: false,
  //     message: `Amenity group with ID ${id} not found`,
  //     statusCode: HttpStatus.NOT_FOUND,
  //   }),
  //   AMENITY_GROUP_FETCHED: (
  //     existingAmenityGroup: AmenityGroup,
  //   ): {
  //     success: boolean;
  //     message: string;
  //     data?: AmenityGroup;
  //     statusCode: number;
  //   } => ({
  //     success: true,
  //     message: `Amenity group with ID ${existingAmenityGroup.id} retrieved successfully`,
  //     data: existingAmenityGroup,
  //     statusCode: HttpStatus.OK,
  //   }),
  //   AMENITY_GROUP_UPDATED: (
  //     updatedAmenityGroup: AmenityGroup,
  //   ): {
  //     success: boolean;
  //     message: string;
  //     data?: AmenityGroup;
  //     statusCode: number;
  //   } => ({
  //     success: true,
  //     message: `Amenity group with ID ${updatedAmenityGroup.id} updated successfully`,
  //     data: updatedAmenityGroup,
  //     statusCode: HttpStatus.OK,
  //   }),
  //   AMENITY_GROUP_FOREIGN_KEY_CONFLICT: (
  //     id: number,
  //   ): {
  //     success: boolean;
  //     message: string;
  //     statusCode: number;
  //   } => ({
  //     success: false,
  //     message: `Amenity group ID ${id} exists and is mapped to amenity, hence cannot be deleted.`,
  //     statusCode: HttpStatus.CONFLICT,
  //   }),
  //   AMENITY_GROUP_DELETED: (
  //     id: number,
  //   ): {
  //     success: boolean;
  //     message: string;
  //     statusCode: number;
  //   } => ({
  //     success: true,
  //     message: `Amenity group with ID ${id} deleted successfully`,
  //     statusCode: HttpStatus.NO_CONTENT,
  //   }),
};
