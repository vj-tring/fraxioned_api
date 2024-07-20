import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '@logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    this.logger.log('Creating a new user');
    const hashedPassword = await bcrypt.hash(createUserDTO.password, 10);
    const user = this.userRepository.create({
      ...createUserDTO,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User created with ID ${savedUser.id}`);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    this.logger.log(`Fetching user with ID ${id}`);
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new HttpException(
        `User with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async update(id: number, updateUserDTO: UpdateUserDTO): Promise<User> {
    this.logger.log(`Updating user with ID ${id}`);
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDTO,
    });
    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new HttpException(
        `User with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`User with ID ${updatedUser.id} updated`);
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing user with ID ${id}`);
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    this.logger.log(`User with ID ${id} removed`);
  }
}
