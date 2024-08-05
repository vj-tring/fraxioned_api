import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'entities/user.entity';
import { UserContactDetails } from 'entities/user_contact_details.entity';
import { LoggerService } from 'services/logger.service';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.response.constant';
import { CreateUserDTO } from 'dto/requests/create-user.dto';
import { UpdateUserDTO } from 'dto/requests/update-user.dto';
import { Role } from 'src/main/entities/role.entity';

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
    // Validate role existence
    const role = await this.roleRepository.findOne({
      where: { id: createUserDto.role.id },
    });
    if (!role) {
      return USER_RESPONSES.USER_NOT_FOUND(createUserDto.role.id);
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

    const savedUser = await this.userRepository.save(user);

    // Save contact details
    const contactDetails = createUserDto.contactDetails.map((detail) => {
      const contactDetail = new UserContactDetails();
      contactDetail.user = savedUser;
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
      relations: ['contactDetails'],
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
      relations: ['contactDetails'],
    });
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      return USER_RESPONSES.USER_NOT_FOUND(id);
    }
    return USER_RESPONSES.USER_FETCHED(user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDTO): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['contactDetails'],
    });
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      return USER_RESPONSES.USER_NOT_FOUND(id);
    }

    // Validate role existence
    if (updateUserDto.role) {
      const role = await this.roleRepository.findOne({
        where: { id: updateUserDto.role.id },
      });
      if (!role) {
        return USER_RESPONSES.USER_NOT_FOUND(updateUserDto.role.id);
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Update contact details
    if (updateUserDto.contactDetails) {
      await this.userContactDetailsRepository.delete({ user: { id } });
      const contactDetails = updateUserDto.contactDetails.map((detail) => {
        const contactDetail = new UserContactDetails();
        contactDetail.user = updatedUser;
        Object.assign(contactDetail, detail);
        return contactDetail;
      });
      await this.userContactDetailsRepository.save(contactDetails);
    }

    this.logger.log(`User with ID ${id} updated`);
    return USER_RESPONSES.USER_UPDATED(updatedUser);
  }

  async deleteUser(id: number): Promise<object> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`User with ID ${id} not found`);
      return USER_RESPONSES.USER_NOT_FOUND(id);
    }

    // Delete contact details
    await this.userContactDetailsRepository.delete({ user: { id } });

    this.logger.log(`User with ID ${id} deleted`);
    return USER_RESPONSES.USER_DELETED;
  }
}
