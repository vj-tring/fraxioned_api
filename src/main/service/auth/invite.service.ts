import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InviteUserDto } from 'src/main/dto/requests/auth/inviteUser.dto';
import { User } from 'src/main/entities/user.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';
import { UserProperties } from 'src/main/entities/user-properties.entity';
import { Role } from 'src/main/entities/role.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { LoggerService } from 'src/main/service/logger.service';
import { authConstants } from 'src/main/commons/constants/authentication/authentication.constants';
import {
  mailSubject,
  mailTemplates,
} from 'src/main/commons/constants/email/mail.constants';
import { INVITE_USER_RESPONSES } from 'src/main/commons/constants/response-constants/auth.constant';
import { ROLE_RESPONSES } from 'src/main/commons/constants/response-constants/role.constant';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.constant';
import { MailService } from 'src/main/email/mail.service';
import { calculateUserProperties } from 'src/main/utils/user-property-add.util';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserContactDetails)
    private readonly userContactRepository: Repository<UserContactDetails>,
    @InjectRepository(UserProperties)
    private readonly userPropertyRepository: Repository<UserProperties>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyDetails)
    private readonly propertyDetailsRepository: Repository<PropertyDetails>,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async inviteUser(inviteUserDto: InviteUserDto): Promise<object> {
    try {
      const {
        email,
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        state,
        country,
        city,
        zipcode,
        phoneNumber,
        roleId,
        createdBy,
        updatedBy,
        userPropertyDetails,
      } = inviteUserDto;

      this.logger.log(`Inviting user with email: ${email}`);

      const existingUserEmail = await this.userContactRepository.findOne({
        where: { primaryEmail: email },
      });
      if (existingUserEmail) {
        this.logger.error(`Email already exists: ${email}`);
        return INVITE_USER_RESPONSES.EMAIL_EXISTS;
      }

      const createdByUser = await this.userRepository.findOne({
        where: { id: createdBy },
      });
      if (!createdByUser) {
        this.logger.error(`CreatedBy user not found with ID: ${createdBy}`);
        return USER_RESPONSES.USER_NOT_FOUND(createdBy);
      }

      const updatedByUser = await this.userRepository.findOne({
        where: { id: updatedBy },
      });
      if (!updatedByUser) {
        this.logger.error(`UpdatedBy user not found with ID: ${updatedBy}`);
        return USER_RESPONSES.USER_NOT_FOUND(updatedBy);
      }

      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        this.logger.error(`Role not found with ID: ${roleId}`);
        return ROLE_RESPONSES.ROLE_NOT_FOUND(roleId);
      }

      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const user = this.userRepository.create({
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        state,
        country,
        city,
        zipcode,
        password: hashedPassword,
        isActive: true,
        createdBy: createdByUser.id,
        updatedBy: updatedByUser.id,
        role: role,
      });
      await this.userRepository.save(user);

      const contact = {
        user,
        primaryEmail: email,
        primaryPhone: phoneNumber,
        createdBy: createdByUser,
        updatedBy: updatedByUser,
      };

      const userContact = this.userContactRepository.create(contact);
      await this.userContactRepository.save(userContact);

      const userPropertyEntities = await calculateUserProperties(
        userPropertyDetails,
        user,
        createdByUser,
        updatedByUser,
        this.propertyRepository,
        this.propertyDetailsRepository,
        this.userPropertyRepository,
        this.logger,
      );

      if (Array.isArray(userPropertyEntities)) {
        for (const userPropertyEntity of userPropertyEntities) {
          await this.userPropertyRepository.save(userPropertyEntity);
        }
      } else {
        // Handle error response
        return userPropertyEntities;
      }

      const loginLink = `${authConstants.hostname}:${authConstants.port}/${authConstants.endpoints.login}`;
      const subject = mailSubject.auth.registration;
      const template = mailTemplates.auth.registration;
      const context = {
        name: `${firstName} ${lastName}`,
        username: email,
        password: tempPassword,
        link: loginLink,
      };

      await this.mailService.sendMail(email, subject, template, context);

      this.logger.log(`Invite sent successfully to ${email}`);
      return INVITE_USER_RESPONSES.INVITE_SUCCESS;
    } catch (error) {
      this.logger.error(`Failed to invite user: ${error.message}`);
      throw error;
    }
  }
}
