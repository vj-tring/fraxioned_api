import { HttpStatus } from '@nestjs/common';
import { PropertySpaceAmenities } from 'src/main/entities/property-space-amenity.entity';

export const PROPERTY_SPACE_AMENITY_RESPONSES = {
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property with ID ${propertyId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_NOT_FOUND: (
    propertySpaceId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property Space with ID ${propertySpaceId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  AMENITY_NOT_FOUND: (
    amenityId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Amenity with ID ${amenityId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  USER_NOT_FOUND: (
    userId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `User with ID ${userId} does not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_AMENITY_ALREADY_EXISTS: (
    propertyId: number,
    amenityId: number,
    propertySpaceId?: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: propertySpaceId
      ? `Property ID ${propertyId} with Amenity ID ${amenityId} and Property Space ID ${propertySpaceId} already exists`
      : `Property ID ${propertyId} with Amenity ID ${amenityId} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  PROPERTY_SPACE_AMENITY_CREATED: (
    savedPropertyAmenity: PropertySpaceAmenities,
    id: number,
  ): {
    success: boolean;
    message: string;
    data: PropertySpaceAmenities;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property Space Amenity with ID ${id} created successfully`,
    data: savedPropertyAmenity,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_SPACE_AMENITIES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No property space amenities are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_AMENITIES_FETCHED: (
    PropertySpaceAmenities: PropertySpaceAmenities[],
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities[];
    statusCode: number;
  } => ({
    success: true,
    message: 'Property Space Amenities retrieved successfully',
    data: PropertySpaceAmenities,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_AMENITY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities;
    statusCode: number;
  } => ({
    success: false,
    message: `Property Space Amenity with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_AMENITY_FETCHED: (
    propertyAmenity: PropertySpaceAmenities,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Amenity with ID ${id} retrieved successfully`,
    data: propertyAmenity,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_AMENITY_UPDATED: (
    updatedPropertyAmenity: PropertySpaceAmenities,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Amenity with ID ${id} updated successfully`,
    data: updatedPropertyAmenity,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_AMENITIES_UPDATED: (): {
    success: boolean;
    message: string;
    data?: PropertySpaceAmenities[];
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Amenities for the selected property updated successfully`,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_AMENITY_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space Amenity with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
  AMENITIES_NOT_FOUND: (
    nonExistingIds: number[],
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Amenities with ID(s) ${nonExistingIds.join(', ')} do not exist`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
};
