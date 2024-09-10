import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../entities/space.entity';
import { SPACE_RESPONSES } from '../commons/constants/response-constants/space.constant';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    private readonly logger: LoggerService,
  ) {}

  async findAllSpaces(): Promise<{
    success: boolean;
    message: string;
    data?: Space[];
    statusCode: number;
  }> {
    try {
      const spaces = await this.spaceRepository.find();

      if (spaces.length === 0) {
        this.logger.log(`No spaces are available`);
        return SPACE_RESPONSES.SPACES_NOT_FOUND();
      }

      this.logger.log(`Retrieved ${spaces.length} spaces successfully.`);
      return SPACE_RESPONSES.SPACES_FETCHED(spaces);
    } catch (error) {
      this.logger.error(
        `Error retrieving spaces: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the spaces',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
