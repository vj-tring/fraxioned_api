import { HttpStatus } from '@nestjs/common';
import { AmenityGroup } from 'src/main/entities/amenity-group.entity';

export const AMENITY_GROUP_RESPONSES = {
  AMENITY_GROUP_ALREADY_EXISTS: (
    amenityGroupName: string,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Amenity Group ${amenityGroupName} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  AMENITY_GROUP_CREATED: (
    savedAmenityGroup: AmenityGroup,
  ): {
    success: boolean;
    message: string;
    data: AmenityGroup;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Amenity Group ${savedAmenityGroup.name} created with ID ${savedAmenityGroup.id}`,
    data: savedAmenityGroup,
    statusCode: HttpStatus.CREATED,
  }),
  AMENITY_GROUPS_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: AmenityGroup[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No amenity groups are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  AMENITY_GROUPS_FETCHED: (
    amenityGroups: AmenityGroup[],
  ): {
    success: boolean;
    message: string;
    data?: AmenityGroup[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${amenityGroups.length} amenity groups successfully.`,
    data: amenityGroups,
    statusCode: HttpStatus.OK,
  }),

  AMENITY_GROUP_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Amenity group with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  AMENITY_GROUP_FETCHED: (
    existingAmenityGroup: AmenityGroup,
  ): {
    success: boolean;
    message: string;
    data?: AmenityGroup;
    statusCode: number;
  } => ({
    success: true,
    message: `Amenity group with ID ${existingAmenityGroup.id} retrieved successfully`,
    data: existingAmenityGroup,
    statusCode: HttpStatus.OK,
  }),
  AMENITY_GROUP_UPDATED: (
    updatedAmenityGroup: AmenityGroup,
  ): {
    success: boolean;
    message: string;
    data?: AmenityGroup;
    statusCode: number;
  } => ({
    success: true,
    message: `Amenity group with ID ${updatedAmenityGroup.id} updated successfully`,
    data: updatedAmenityGroup,
    statusCode: HttpStatus.OK,
  }),
  //   SPACE_FOREIGN_KEY_CONFLICT: (
  //     id: number,
  //   ): {
  //     success: boolean;
  //     message: string;
  //     statusCode: number;
  //   } => ({
  //     success: false,
  //     message: `Space ID ${id} exists and is mapped to space type, hence cannot be deleted.`,
  //     statusCode: HttpStatus.CONFLICT,
  //   }),
  AMENITY_GROUP_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Amenity group with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
