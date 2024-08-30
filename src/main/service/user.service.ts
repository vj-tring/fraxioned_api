import { Injectable } from '@nestjs/common';
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
  ) {}

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

    const contactDetails = createUserDto.contactDetails.map((detail) => {
      const contactDetail = new UserContactDetails();
      contactDetail.user = savedUser;
      contactDetail.createdBy = createdByUser;
      contactDetail.updatedBy = createdByUser;
      Object.assign(contactDetail, detail);
      return contactDetail;
    });
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
    const user = await this.userRepository.findOne({
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
      },
    });
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      return USER_RESPONSES.USER_NOT_FOUND(id);
    }
    return USER_RESPONSES.USER_FETCHED(user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDTO): Promise<object> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['contactDetails'],
      });

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        return USER_RESPONSES.USER_NOT_FOUND(id);
      }

      if (updateUserDto.role) {
        const role = await this.roleRepository.findOne({
          where: { id: updateUserDto.role.id },
        });
        if (!role) {
          return ROLE_RESPONSES.ROLE_NOT_FOUND(updateUserDto.role.id);
        }
      }

      const updatedByUser = await this.userRepository.findOne({
        where: { id: updateUserDto.updatedBy },
      });
      if (!updatedByUser) {
        return USER_RESPONSES.USER_NOT_FOUND(updateUserDto.updatedBy);
      }

      const { contactDetails, ...userDetails } = updateUserDto;
      Object.assign(user, userDetails);

      if (updateUserDto.password) {
        user.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.userRepository.save(user);

      if (contactDetails) {
        for (const detail of contactDetails) {
          if (detail.id) {
            // Update existing contact detail
            const existingContactDetail =
              await this.userContactDetailsRepository.findOne({
                where: { id: detail.id, user: { id: updatedUser.id } },
              });
            if (existingContactDetail) {
              Object.assign(existingContactDetail, detail);
              existingContactDetail.updatedBy = updatedByUser;
              await this.userContactDetailsRepository.save(
                existingContactDetail,
              );
            }
          } else {
            // Add new contact detail
            const newContactDetail = new UserContactDetails();
            Object.assign(newContactDetail, detail);
            newContactDetail.user = updatedUser;
            newContactDetail.createdBy = updatedByUser;
            newContactDetail.updatedBy = updatedByUser;
            await this.userContactDetailsRepository.save(newContactDetail);
          }
        }
      }

      return updatedUser;
    } catch (error) {
      throw error;
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
