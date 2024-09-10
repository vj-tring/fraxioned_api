import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { SpaceTypes } from '../entities/space-types.entity';
import { SPACE_TYPES_RESPONSES } from '../commons/constants/response-constants/space-types.constant';

@Injectable()
export class SpaceTypesService {
  constructor(
    @InjectRepository(SpaceTypes)
    private readonly spaceTypesRepository: Repository<SpaceTypes>,
    private readonly logger: LoggerService,
  ) {}

  async findAllSpaceTypes(): Promise<{
    success: boolean;
    message: string;
    data?: SpaceTypes[];
    statusCode: number;
  }> {
    try {
      const spaceTypes = await this.spaceTypesRepository.find({
        relations: ['space'],
        select: {
          space: {
            id: true,
            name: true,
          },
        },
      });

      if (spaceTypes.length === 0) {
        this.logger.log(`No space types are available`);

        return SPACE_TYPES_RESPONSES.SPACE_TYPES_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${spaceTypes.length} space types successfully.`,
      );

      return SPACE_TYPES_RESPONSES.SPACE_TYPES_FETCHED(spaceTypes);
    } catch (error) {
      this.logger.error(
        `Error retrieving space types: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all space types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
