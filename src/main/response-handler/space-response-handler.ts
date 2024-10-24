import { Injectable } from '@nestjs/common';
import { LoggerService } from '../service/logger.service';
import { ApiResponse } from '../commons/response-body/common.responses';
import { Space } from '../entities/space.entity';
import { SPACE_RESPONSES } from '../commons/constants/response-constants/space.constant';

@Injectable()
export class SpaceResponseHandler {
  constructor(private readonly logger: LoggerService) {}

  async handleExistingSpace(name: string): Promise<ApiResponse<Space>> {
    this.logger.error(`Space with name '${name}' already exists`);
    return SPACE_RESPONSES.SPACE_ALREADY_EXISTS(name);
  }

  async handleSpaceNotFound(): Promise<ApiResponse<null>> {
    this.logger.error(`Space not found`);
    return SPACE_RESPONSES.SPACE_NOT_FOUND();
  }

  async handleSpaceCreated(savedSpace: Space): Promise<ApiResponse<Space>> {
    this.logger.log(`Space ${savedSpace.name} created successfully`);
    return SPACE_RESPONSES.SPACE_CREATED(savedSpace);
  }

  async handleNoSpacesAvailable(): Promise<ApiResponse<null>> {
    this.logger.log(`No spaces are available`);
    return SPACE_RESPONSES.SPACES_NOT_FOUND();
  }

  async handleSpacesFetched(
    existingSpaces: Space[],
  ): Promise<ApiResponse<Space[]>> {
    this.logger.log(`Retrieved ${existingSpaces.length} spaces successfully.`);
    return SPACE_RESPONSES.SPACES_FETCHED(existingSpaces);
  }

  async handleSpaceFetched(existingSpace: Space): Promise<ApiResponse<Space>> {
    this.logger.log(`Space '${existingSpace.name}' retrieved successfully.`);
    return SPACE_RESPONSES.SPACE_FETCHED(existingSpace);
  }

  async handleSpaceUpdated(updatedSpace: Space): Promise<ApiResponse<Space>> {
    this.logger.log(`Space ${updatedSpace.name} updated successfully.`);
    return SPACE_RESPONSES.SPACE_UPDATED(updatedSpace);
  }

  async handleSpaceForeignKeyConflict(
    spaceName: string,
  ): Promise<ApiResponse<null>> {
    this.logger.warn(
      `Space '${spaceName}' exists and is mapped to a property, hence cannot be deleted.`,
    );
    return SPACE_RESPONSES.SPACE_FOREIGN_KEY_CONFLICT(spaceName);
  }

  async handleSpaceDeleted(spaceName: string): Promise<ApiResponse<null>> {
    this.logger.log(`Space '${spaceName}' deleted successfully.`);
    return SPACE_RESPONSES.SPACE_DELETED(spaceName);
  }
}
