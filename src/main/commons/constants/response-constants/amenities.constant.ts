import { HttpStatus } from '@nestjs/common';
import { Amenities } from 'src/main/entities/amenities.entity';

export const AMENITIES_RESPONSES = {
  AMENITY_ALREADY_EXISTS: (
    amenityName: string,
    amenityGroupId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Amenity ${amenityName} for the type ${amenityGroupId} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),

  USER_NOT_FOUND: (
    createdBy: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${createdBy} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  AMENITY_CREATED: (
    savedAmenity: Amenities,
    amenityName: string,
    amenityId: number,
  ): {
    success: boolean;
    message: string;
    data: Amenities;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Amenity ${amenityName} created with ID ${amenityId}`,
    data: savedAmenity,
    statusCode: HttpStatus.CREATED,
  }),
  AMENITIES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: Amenities[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No amenities are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  AMENITIES_FETCHED: (
    amenities: Amenities[],
  ): {
    success: boolean;
    message: string;
    data?: Amenities[];
    statusCode: number;
  } => ({
    success: true,
    message: 'Amenities retrieved successfully',
    data: amenities,
    statusCode: HttpStatus.OK,
  }),
  AMENITY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: number;
  } => ({
    success: false,
    message: `Amenity with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  AMENITY_FETCHED: (
    amenity: Amenities,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: number;
  } => ({
    success: true,
    message: `Amenity with ID ${id} retrieved successfully`,
    data: amenity,
    statusCode: HttpStatus.OK,
  }),
  AMENITY_UPDATED: (
    updatedAmenity: Amenities,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: Amenities;
    statusCode: number;
  } => ({
    success: true,
    message: `Amenity with ID ${id} updated successfully`,
    data: updatedAmenity,
    statusCode: HttpStatus.OK,
  }),
  AMENITY_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Amenity with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  AMENITY_FOREIGN_KEY_CONFLICT: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Amenity ID ${id} exists and is mapped to property, hence cannot be deleted.`,
    statusCode: HttpStatus.CONFLICT,
  }),
};
