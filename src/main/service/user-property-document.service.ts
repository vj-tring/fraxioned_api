import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { Property } from '../entities/property.entity';
import { User } from '../entities/user.entity';
import { S3UtilsService } from './s3-utils.service';
import { UserPropertyDocument } from '../entities/user-property-document.entity';
import { USER_PROPERTY_DOCUMENT_RESPONSES } from '../commons/constants/response-constants/user-document.constant';
import { CreateUserPropertyDocumentDto } from '../dto/requests/user-property-document/create-user-document.dto';
import { UpdateUserPropertyDocumentDto } from '../dto/requests/user-property-document/update-user-document.dto';

@Injectable()
export class UserPropertyDocumentsService {
  constructor(
    @InjectRepository(UserPropertyDocument)
    private readonly userPropertyDocumentsRepository: Repository<UserPropertyDocument>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
  ) {}

  async createUserPropertyDocuments(
    createUserPropertyDocumentsDtos: CreateUserPropertyDocumentDto[],
  ): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument[];
    statusCode: number;
  }> {
    try {
      const propertyId = createUserPropertyDocumentsDtos[0].property.id;
      const createdByUserId = createUserPropertyDocumentsDtos[0].createdBy.id;

      const existingProperty = await this.propertiesRepository.findOne({
        where: { id: propertyId },
      });
      if (!existingProperty) {
        this.logger.error(`Property with ID ${propertyId} does not exist`);
        return USER_PROPERTY_DOCUMENT_RESPONSES.PROPERTY_NOT_FOUND(propertyId);
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: createdByUserId },
      });
      if (!existingUser) {
        this.logger.error(`User with ID ${createdByUserId} does not exist`);
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_NOT_FOUND(createdByUserId);
      }

      const uploadPromises = createUserPropertyDocumentsDtos.map(
        async (dto) => {
          const folderName = `user_properties_media/${existingProperty.propertyName}/documents`;
          const fileName = dto.documentFile.originalname;

          const documentUrlLocation = await this.s3UtilsService.uploadFileToS3(
            folderName,
            fileName,
            dto.documentFile.buffer,
            dto.documentFile.mimetype,
          );

          const newDocument = this.userPropertyDocumentsRepository.create({
            property: dto.property,
            user: dto.user,
            createdBy: dto.createdBy,
            documentName: dto.name,
            documentType: dto.documentType,
            documentUrl: documentUrlLocation,
          });

          const savedDocument =
            await this.userPropertyDocumentsRepository.save(newDocument);
          return savedDocument;
        },
      );

      const uploadedDocuments = await Promise.all(uploadPromises);

      this.logger.log(
        `${uploadedDocuments.length} user property documents created successfully`,
      );
      return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENTS_CREATED(
        uploadedDocuments,
      );
    } catch (error) {
      this.logger.error(
        `Error creating user property documents: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        `An error occurred while creating the user property documents`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllUserPropertyDocuments(): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument[];
    statusCode: number;
  }> {
    try {
      const userPropertyDocuments =
        await this.userPropertyDocumentsRepository.find({
          relations: ['property', 'user', 'createdBy', 'updatedBy'],
          select: {
            property: {
              id: true,
              propertyName: true,
            },
            user: {
              id: true,
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
        });

      if (userPropertyDocuments.length === 0) {
        this.logger.log(`No user property documents are found`);
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENTS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${userPropertyDocuments.length} user property documents`,
      );
      return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENTS_FETCHED(
        userPropertyDocuments,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving user property documents: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all user property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserPropertyDocumentsByUserId(userId: number): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument[];
    statusCode: number;
  }> {
    try {
      const userPropertyDocuments =
        await this.userPropertyDocumentsRepository.find({
          where: { user: { id: userId } },
          relations: ['property', 'user', 'createdBy', 'updatedBy'],
          select: {
            property: {
              id: true,
              propertyName: true,
            },
            user: {
              id: true,
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
        });

      if (userPropertyDocuments.length === 0) {
        this.logger.log(
          `No user property documents found for user with ID ${userId}`,
        );
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENTS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${userPropertyDocuments.length} user property documents for user with ID ${userId}`,
      );
      return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENTS_FETCHED(
        userPropertyDocuments,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving user property documents for user with ID ${userId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving user property documents by user id',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserPropertyDocumentById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument;
    statusCode: number;
  }> {
    try {
      const userPropertyDocument =
        await this.userPropertyDocumentsRepository.findOne({
          relations: ['property', 'user', 'createdBy', 'updatedBy'],
          select: {
            property: {
              id: true,
              propertyName: true,
            },
            user: {
              id: true,
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
          where: { id },
        });

      if (!userPropertyDocument) {
        this.logger.error(`User Property Document with ID ${id} not found`);
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_NOT_FOUND(
          id,
        );
      }
      this.logger.log(
        `User Property Document with ID ${id} retrieved successfully`,
      );
      return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_FETCHED(
        userPropertyDocument,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving user property document with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the user property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserPropertyDocumentDetail(
    id: number,
    updateUserPropertyDocumentDto: UpdateUserPropertyDocumentDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: UserPropertyDocument;
    statusCode: number;
  }> {
    try {
      const userPropertyDocument =
        await this.userPropertyDocumentsRepository.findOne({
          relations: ['property', 'user', 'createdBy', 'updatedBy'],
          select: {
            property: {
              id: true,
              propertyName: true,
            },
            user: {
              id: true,
            },
            createdBy: {
              id: true,
            },
            updatedBy: {
              id: true,
            },
          },
          where: { id },
        });

      if (!userPropertyDocument) {
        this.logger.error(`User Property Document with ID ${id} not found`);
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_NOT_FOUND(
          id,
        );
      }

      const existingProperty = await this.propertiesRepository.findOne({
        where: { id: updateUserPropertyDocumentDto.property.id },
      });
      if (!existingProperty) {
        this.logger.error(
          `Property with ID ${updateUserPropertyDocumentDto.property.id} does not exist`,
        );
        return USER_PROPERTY_DOCUMENT_RESPONSES.PROPERTY_NOT_FOUND(
          updateUserPropertyDocumentDto.property.id,
        );
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: updateUserPropertyDocumentDto.updatedBy.id },
      });
      if (!existingUser) {
        this.logger.error(
          `User with ID ${updateUserPropertyDocumentDto.updatedBy.id} does not exist`,
        );
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_NOT_FOUND(
          updateUserPropertyDocumentDto.updatedBy.id,
        );
      }

      const folderName = `user_properties_media/${existingProperty.propertyName}/documents`;
      const fileName = updateUserPropertyDocumentDto.documentFile.originalname;

      let documentUrlLocation = userPropertyDocument.documentUrl;

      const s3Key = await this.s3UtilsService.extractS3Key(
        userPropertyDocument.documentUrl,
      );

      if (decodeURIComponent(s3Key) != folderName + '/' + fileName) {
        const headObject =
          await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
        if (!headObject) {
          return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_NOT_FOUND_IN_AWS_S3(
            s3Key,
          );
        }

        await this.s3UtilsService.deleteObjectFromS3(s3Key);

        documentUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          updateUserPropertyDocumentDto.documentFile.buffer,
          updateUserPropertyDocumentDto.documentFile.mimetype,
        );
      }

      userPropertyDocument.property = existingProperty;
      userPropertyDocument.updatedBy = existingUser;
      userPropertyDocument.documentName = updateUserPropertyDocumentDto.name;
      userPropertyDocument.documentType =
        updateUserPropertyDocumentDto.documentType;
      userPropertyDocument.documentUrl = documentUrlLocation;

      const updatedDocument =
        await this.userPropertyDocumentsRepository.save(userPropertyDocument);

      this.logger.log(
        `User Property Document with ID ${id} updated successfully`,
      );
      return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_UPDATED(
        updatedDocument,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating user property document with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the user property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUserPropertyDocumentById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const userPropertyDocument =
        await this.userPropertyDocumentsRepository.findOne({
          where: { id },
        });

      if (!userPropertyDocument) {
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_NOT_FOUND(
          id,
        );
      }

      const s3Key = await this.s3UtilsService.extractS3Key(
        userPropertyDocument.documentUrl,
      );

      const headObject =
        await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
      if (!headObject) {
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_NOT_FOUND_IN_AWS_S3(
          s3Key,
        );
      }

      await this.s3UtilsService.deleteObjectFromS3(s3Key);

      const result = await this.userPropertyDocumentsRepository.delete(id);
      if (result.affected === 0) {
        return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_NOT_FOUND(
          id,
        );
      }
      return USER_PROPERTY_DOCUMENT_RESPONSES.USER_PROPERTY_DOCUMENT_DELETED(
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting user property document with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the user property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
