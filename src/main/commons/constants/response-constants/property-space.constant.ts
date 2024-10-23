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
  PROPERTY_SPACES_NOT_FOUND: (): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: 'No property spaces are available',
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACES_FETCHED: (
    propertySpaces: PropertySpace[],
  ): {
    success: boolean;
    message: string;
    data?: PropertySpace[];
    statusCode: number;
  } => ({
    success: true,
    message: `Retrieved ${propertySpaces.length} property spaces successfully.`,
    data: propertySpaces,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_NOT_FOUND: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: false,
    message: `Property space with ID ${id} not found`,
    statusCode: HttpStatus.NOT_FOUND,
  }),
  PROPERTY_SPACE_FETCHED: (
    existingPropertySpace: PropertySpace,
  ): {
    success: boolean;
    message: string;
    data?: PropertySpace;
    statusCode: number;
  } => ({
    success: true,
    message: `Property Space with ID ${existingPropertySpace.id} retrieved successfully`,
    data: existingPropertySpace,
    statusCode: HttpStatus.OK,
  }),
  PROPERTY_SPACE_DELETED: (
    id: number,
  ): {
    success: boolean;
    message: string;
    statusCode: number;
  } => ({
    success: true,
    message: `Property space with ID ${id} deleted successfully`,
    statusCode: HttpStatus.NO_CONTENT,
  }),
};
