import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'entities/user.entity';
import { UserContactDetails } from 'entities/user-contact-details.entity';
import { LoggerService } from 'services/logger.service';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.constant';
import { Role } from 'src/main/entities/role.entity';
import { ROLE_RESPONSES } from '../commons/constants/response-constants/role.constant';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from '../dto/requests/user/create-user.dto';
import { UpdateUserDTO } from '../dto/requests/user/update-user.dto';
import { ApiResponse } from '../commons/response-body/common.responses';
import { S3UtilsService } from './s3-utils.service';
import { MEDIA_IMAGE_RESPONSES } from '../commons/constants/response-constants/media-image.constant';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserContactDetails)
    private readonly userContactDetailsRepository: Repository<UserContactDetails>,
    private readonly logger: LoggerService,
    private readonly s3UtilsService: S3UtilsService,
  ) {}

  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['contactDetails', 'role'],
      select: {
        id: true,
        role: { id: true, roleName: true },
        firstName: true,
        lastName: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        zipcode: true,
        country: true,
        imageURL: true,
        isActive: true,
        lastLoginTime: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
        contactDetails: {
          id: true,
          optionalEmailOne: true,
          optionalEmailTwo: true,
          optionalPhoneOne: true,
          optionalPhoneTwo: true,
          primaryEmail: true,
          primaryPhone: true,
          secondaryEmail: true,
          secondaryPhone: true,
        },
      },
    });
  }

  async handleUserNotFound(id: number): Promise<ApiResponse<null>> {
    this.logger.error(`User with ID ${id} not found`);
    return USER_RESPONSES.USER_NOT_FOUND(id);
  }
  async createUser(createUserDto: CreateUserDTO): Promise<object> {
    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.role.id },
    });
    if (!role) {
      return ROLE_RESPONSES.ROLE_NOT_FOUND(createUserDto.role.id);
    }

    const createdByUser = await this.userRepository.findOne({
      where: { id: createUserDto.createdBy },
    });
    if (!createdByUser) {
      return USER_RESPONSES.USER_NOT_FOUND(createUserDto.createdBy);
    }

    const existingUser = await this.userRepository.findOne({
      where: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      },
    });
    if (existingUser) {
      this.logger.warn(
        `User with name ${createUserDto.firstName} ${createUserDto.lastName} already exists`,
      );
      return USER_RESPONSES.USER_ALREADY_EXISTS(existingUser.id);
    }

    const user = new User();
    Object.assign(user, createUserDto);

    user.password = await bcrypt.hash(createUserDto.password, 10);

    const savedUser = await this.userRepository.save(user);

    const contactDetails = new UserContactDetails();
    contactDetails.user = savedUser;
    contactDetails.primaryEmail = createUserDto.contactDetails.primaryEmail;
    contactDetails.primaryPhone = createUserDto.contactDetails.primaryPhone;
    contactDetails.secondaryEmail = createUserDto.contactDetails.secondaryEmail;
    contactDetails.secondaryPhone = createUserDto.contactDetails.secondaryPhone;
    contactDetails.optionalEmailOne =
      createUserDto.contactDetails.optionalEmailOne;
    contactDetails.optionalPhoneOne =
      createUserDto.contactDetails.optionalPhoneOne;
    contactDetails.optionalEmailTwo =
      createUserDto.contactDetails.optionalEmailTwo;
    contactDetails.optionalPhoneTwo =
      createUserDto.contactDetails.optionalPhoneTwo;
    contactDetails.createdBy = createdByUser;
    contactDetails.updatedBy = createdByUser;
    await this.userContactDetailsRepository.save(contactDetails);

    this.logger.log(`User created with ID ${savedUser.id}`);
    return USER_RESPONSES.USER_CREATED(savedUser);
  }

  async getUsers(): Promise<object> {
    this.logger.log('Fetching all users');
    const users = await this.userRepository.find({
      relations: ['contactDetails', 'role'],
      select: {
        id: true,
        role: { id: true, roleName: true },
        contactDetails: {
          id: true,
          optionalEmailOne: true,
          optionalEmailTwo: true,
          optionalPhoneOne: true,
          optionalPhoneTwo: true,
          primaryEmail: true,
          primaryPhone: true,
          secondaryEmail: true,
          secondaryPhone: true,
        },
        firstName: true,
        lastName: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        zipcode: true,
        country: true,
        imageURL: true,
        isActive: true,
        lastLoginTime: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
    });
    if (users.length === 0) {
      this.logger.warn('No users found');
      return USER_RESPONSES.USERS_NOT_FOUND();
    }
    return USER_RESPONSES.USERS_FETCHED(users);
  }

  async getUserById(id: number): Promise<object> {
    this.logger.log(`Fetching user with ID ${id}`);
    const user = await this.findUserById(id);
    if (!user) {
      return await this.handleUserNotFound(id);
    }
    return USER_RESPONSES.USER_FETCHED(user);
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDTO,
    profileImage?: Express.Multer.File,
  ): Promise<object> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['contactDetails', 'role'],
        select: {
          role: {
            id: true,
            roleName: true,
          },
        },
      });
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        return USER_RESPONSES.USER_NOT_FOUND(id);
      }

      Object.assign(user, updateUserDto);

      if (updateUserDto.password) {
        user.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      if (profileImage) {
        const folderName = 'user_profiles';
        const fileExtension = profileImage.originalname.split('.').pop();
        const fileName = `${user.id}.${fileExtension}`;
        let s3Key = '';
        let imageUrlLocation = user.imageURL;

        if (imageUrlLocation) {
          s3Key = await this.s3UtilsService.extractS3Key(imageUrlLocation);
        }

        if (s3Key) {
          if (decodeURIComponent(s3Key) != folderName + '/' + fileName) {
            const headObject =
              await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
            if (!headObject) {
              return MEDIA_IMAGE_RESPONSES.MEDIA_IMAGE_NOT_FOUND_IN_AWS_S3(
                s3Key,
              );
            }
            await this.s3UtilsService.deleteObjectFromS3(s3Key);
          }
        }
        imageUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          profileImage.buffer,
          profileImage.mimetype,
        );

        user.imageURL = imageUrlLocation;
      }

      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`User with ID ${id} updated successfully`);
      return USER_RESPONSES.USER_UPDATED(updatedUser);
    } catch (error) {
      this.logger.error(
        `Error updating user with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async setActiveStatus(id: number, isActive: boolean): Promise<object> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      return USER_RESPONSES.USER_NOT_FOUND(id);
    }

    if (user.isActive == isActive) {
      const status = isActive ? 'active' : 'inactive';
      this.logger.warn(`User with ID ${id} is already ${status}`);
      return USER_RESPONSES.USER_ALREADY_IN_STATE(id, status);
    }

    user.isActive = isActive;
    await this.userRepository.save(user);

    const action = isActive ? 'activated' : 'deactivated';
    this.logger.log(`User with ID ${id} ${action}`);
    return USER_RESPONSES.USER_STATE_CHANGED(id, action);
  }
}
