import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../entities/space.entity';
import { SPACE_RESPONSES } from '../commons/constants/response-constants/space.constant';
import { CreateSpaceDto } from '../dto/requests/space/create-space.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async createSpace(createSpaceDto: CreateSpaceDto): Promise<{
    success: boolean;
    message: string;
    data?: Space;
    statusCode: number;
  }> {
    try {
      this.logger.log(`Creating space ${createSpaceDto.name}`);
      const existingSpace = await this.spaceRepository.findOne({
        where: {
          name: createSpaceDto.name,
        },
      });
      if (existingSpace) {
        this.logger.error(
          `Error creating space: Space ${createSpaceDto.name} already exists`,
        );
        return SPACE_RESPONSES.SPACE_ALREADY_EXISTS(createSpaceDto.name);
      }

      const user = await this.userRepository.findOne({
        where: {
          id: createSpaceDto.createdBy.id,
        },
      });
      if (!user) {
        this.logger.error(
          `User with ID ${createSpaceDto.createdBy.id} does not exist`,
        );
        return SPACE_RESPONSES.USER_NOT_FOUND(createSpaceDto.createdBy.id);
      }

      const space = this.spaceRepository.create({
        ...createSpaceDto,
      });
      const savedSpace = await this.spaceRepository.save(space);
      this.logger.log(
        `Space ${createSpaceDto.name} created with ID ${savedSpace.id}`,
      );
      return SPACE_RESPONSES.SPACE_CREATED(savedSpace);
    } catch (error) {
      this.logger.error(
        `Error creating space: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while creating the space',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
