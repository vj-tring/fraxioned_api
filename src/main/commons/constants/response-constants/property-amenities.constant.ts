import { HttpStatus } from '@nestjs/common';
import { PropertyAmenities } from 'src/main/entities/property_amenities.entity';

export const PROPERTY_AMENITY_RESPONSES = {
  PROPERTY_NOT_FOUND: (
    propertyId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property with ID ${propertyId} does not exist`,
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
  PROPERTY_AMENITY_ALREADY_EXISTS: (
    propertyId: number,
    amenityId: number,
  ): { success: boolean; message: string; statusCode: HttpStatus } => ({
    success: false,
    message: `Property ID ${propertyId} with Amenity ID ${amenityId} already exists`,
    statusCode: HttpStatus.CONFLICT,
  }),
  PROPERTY_AMENITY_CREATED: (
    savedPropertyAmenity: PropertyAmenities,
    id: number,
  ): {
    success: boolean;
    message: string;
    data: PropertyAmenities;
    statusCode: HttpStatus;
  } => ({
    success: true,
    message: `Property Amenity with ID ${id} created successfully`,
    data: savedPropertyAmenity,
    statusCode: HttpStatus.CREATED,
  }),
  PROPERTY_AMENITIES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    data?: PropertyAmenities[];
    statusCode: number;
  } => ({
    success: true,
    message: 'No property amenities are available',
    data: [],
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_AMENITIES_FETCHED: (
    propertyAmenities: PropertyAmenities[],
  ): {
    success: boolean;
    message: string;
    data?: PropertyAmenities[];
    statusCode: number;
  } => ({
    success: true,
    message: 'Property amenities retrieved successfully',
    data: propertyAmenities,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_AMENITY_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: number;
  } => ({
    success: false,
    message: `Property Amenity with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_AMENITY_FETCHED: (
    propertyAmenity: PropertyAmenities,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Amenity with ID ${id} retrieved successfully`,
    data: propertyAmenity,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_AMENITY_UPDATED: (
    updatedPropertyAmenity: PropertyAmenities,
    id: number,
  ): {
    success: boolean;
    message: string;
    data?: PropertyAmenities;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Amenity with ID ${id} updated successfully`,
    data: updatedPropertyAmenity,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_AMENITY_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Amenity with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
