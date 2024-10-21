import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InviteUserDto } from 'src/main/dto/requests/auth/inviteUser.dto';
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
import { calculateAvailableNightsForUserByProperty } from 'src/main/utils/user-property.util';
import { PropertyDetailsRepository } from 'src/main/repository/property-details.repository';
import { PropertyRepository } from 'src/main/repository/property.repository';
import { RoleRepository } from 'src/main/repository/role.repository';
import { UserContactRepository } from 'src/main/repository/user-contact.repository';
import { UserPropertyRepository } from 'src/main/repository/user-property.repository';
import { UserRepository } from 'src/main/repository/user.repository';

@Injectable()
export class InviteService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userContactRepository: UserContactRepository,
    private readonly userPropertyRepository: UserPropertyRepository,
    private readonly roleRepository: RoleRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly propertyDetailsRepository: PropertyDetailsRepository,
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

      const existingUserEmail =
        await this.userContactRepository.findOneByEmail(email);
      if (existingUserEmail) {
        this.logger.error(`Email already exists: ${email}`);
        return INVITE_USER_RESPONSES.EMAIL_EXISTS;
      }

      const createdByUser = await this.userRepository.findOne(createdBy);
      if (!createdByUser) {
        this.logger.error(`CreatedBy user not found with ID: ${createdBy}`);
        return USER_RESPONSES.USER_NOT_FOUND(createdBy);
      }

      const updatedByUser = await this.userRepository.findOne(updatedBy);
      if (!updatedByUser) {
        this.logger.error(`UpdatedBy user not found with ID: ${updatedBy}`);
        return USER_RESPONSES.USER_NOT_FOUND(updatedBy);
      }

      const role = await this.roleRepository.findOne(roleId);
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

      const contact = this.userContactRepository.create({
        user,
        primaryEmail: email,
        primaryPhone: phoneNumber,
        createdBy: createdByUser,
        updatedBy: updatedByUser,
      });
      await this.userContactRepository.save(contact);

      const userPropertyEntities =
        await calculateAvailableNightsForUserByProperty(
          userPropertyDetails,
          user,
          this.propertyRepository,
          this.propertyDetailsRepository,
          this.userPropertyRepository,
          this.logger,
          createdByUser,
        );

      if (!Array.isArray(userPropertyEntities)) {
        return userPropertyEntities;
      }

      const savedUserProperties =
        await this.userPropertyRepository.saveUserProperties(
          userPropertyEntities,
        );
      this.logger.log(
        `UserProperty Created successfully ${savedUserProperties}`,
      );

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
