// Service
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { Property } from '../entities/property.entity';
import { User } from '../entities/user.entity';
import { S3UtilsService } from '../service/s3-utils.service';
import { PropertyDocuments } from '../entities/property-document.entity';
import { CreatePropertyDocumentsDto } from '../dto/requests/property-document/create-property-document.dto';
import { PROPERTY_DOCUMENTS_RESPONSES } from '../commons/constants/response-constants/property-document.constant';
import { UpdatePropertyDocumentDto } from '../dto/requests/property-document/update-property-document.dto';

@Injectable()
export class PropertyDocumentsService {
  constructor(
    @InjectRepository(PropertyDocuments)
    private readonly propertyDocumentsRepository: Repository<PropertyDocuments>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
  ) {}

  async createPropertyDocuments(
    createPropertyDocumentsDtos: CreatePropertyDocumentsDto[],
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments[];
    statusCode: number;
  }> {
    try {
      const propertyId = createPropertyDocumentsDtos[0].property.id;
      const createdByUserId = createPropertyDocumentsDtos[0].createdBy.id;

      const existingProperty = await this.propertiesRepository.findOne({
        where: { id: propertyId },
      });
      if (!existingProperty) {
        this.logger.error(`Property with ID ${propertyId} does not exist`);
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_NOT_FOUND(propertyId);
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: createdByUserId },
      });
      if (!existingUser) {
        this.logger.error(`User with ID ${createdByUserId} does not exist`);
        return PROPERTY_DOCUMENTS_RESPONSES.USER_NOT_FOUND(createdByUserId);
      }

      const uploadPromises = createPropertyDocumentsDtos.map(async (dto) => {
        const folderName = `properties_media/${existingProperty.propertyName}/documents`;
        const fileName = dto.documentFile.originalname;

        const documentUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          dto.documentFile.buffer,
          dto.documentFile.mimetype,
        );

        const newDocument = this.propertyDocumentsRepository.create({
          property: dto.property,
          createdBy: dto.createdBy,
          documentName: dto.name,
          documentType: dto.documentType,
          documentUrl: documentUrlLocation,
        });

        const savedDocument =
          await this.propertyDocumentsRepository.save(newDocument);
        return savedDocument;
      });

      const uploadedDocuments = await Promise.all(uploadPromises);

      this.logger.log(
        `${uploadedDocuments.length} property documents created successfully`,
      );
      return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_CREATED(
        uploadedDocuments,
      );
    } catch (error) {
      this.logger.error(
        `Error creating property documents: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        `An error occurred while creating the property documents`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllPropertyDocuments(): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments[];
    statusCode: number;
  }> {
    try {
      const propertyDocuments = await this.propertyDocumentsRepository.find({
        relations: ['property', 'createdBy', 'updatedBy'],
        select: {
          property: {
            id: true,
            propertyName: true,
          },
          createdBy: {
            id: true,
          },
          updatedBy: {
            id: true,
          },
        },
      });

      if (propertyDocuments.length === 0) {
        this.logger.log(`No property documents are found`);
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertyDocuments.length} property documents`,
      );
      return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_FETCHED(
        propertyDocuments,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property documents: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving all property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPropertyDocumentById(id: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: number;
  }> {
    try {
      const propertyDocument = await this.propertyDocumentsRepository.findOne({
        relations: ['property', 'createdBy', 'updatedBy'],
        select: {
          property: {
            id: true,
            propertyName: true,
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

      if (!propertyDocument) {
        this.logger.error(`Property Document with ID ${id} not found`);
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_NOT_FOUND(id);
      }
      this.logger.log(`Property Document with ID ${id} retrieved successfully`);
      return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_FETCHED(
        propertyDocument,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property document with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving the property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePropertyDocumentDetail(
    id: number,
    updatePropertyDocumentDto: UpdatePropertyDocumentDto,
  ): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments;
    statusCode: number;
  }> {
    try {
      const propertyDocument = await this.propertyDocumentsRepository.findOne({
        relations: ['property', 'createdBy', 'updatedBy'],
        select: {
          property: {
            id: true,
            propertyName: true,
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

      if (!propertyDocument) {
        this.logger.error(`Property Document with ID ${id} not found`);
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_NOT_FOUND(id);
      }

      const existingProperty = await this.propertiesRepository.findOne({
        where: { id: updatePropertyDocumentDto.property.id },
      });
      if (!existingProperty) {
        this.logger.error(
          `Property with ID ${updatePropertyDocumentDto.property.id} does not exist`,
        );
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_NOT_FOUND(
          updatePropertyDocumentDto.property.id,
        );
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: updatePropertyDocumentDto.updatedBy.id },
      });
      if (!existingUser) {
        this.logger.error(
          `User with ID ${updatePropertyDocumentDto.updatedBy.id} does not exist`,
        );
        return PROPERTY_DOCUMENTS_RESPONSES.USER_NOT_FOUND(
          updatePropertyDocumentDto.updatedBy.id,
        );
      }

      const folderName = `properties_media/${existingProperty.propertyName}/documents`;
      const fileName = updatePropertyDocumentDto.documentFile.originalname;

      let documentUrlLocation = propertyDocument.documentUrl;

      const s3Key = await this.s3UtilsService.extractS3Key(
        propertyDocument.documentUrl,
      );

      if (decodeURIComponent(s3Key) != folderName + '/' + fileName) {
        const headObject =
          await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
        if (!headObject) {
          return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_NOT_FOUND_IN_AWS_S3(
            s3Key,
          );
        }

        await this.s3UtilsService.deleteObjectFromS3(s3Key);

        documentUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          updatePropertyDocumentDto.documentFile.buffer,
          updatePropertyDocumentDto.documentFile.mimetype,
        );
      }

      propertyDocument.property = existingProperty;
      propertyDocument.updatedBy = existingUser;
      propertyDocument.documentName = updatePropertyDocumentDto.name;
      propertyDocument.documentType = updatePropertyDocumentDto.documentType;
      propertyDocument.documentUrl = documentUrlLocation;

      const updatedDocument =
        await this.propertyDocumentsRepository.save(propertyDocument);

      this.logger.log(`Property Document with ID ${id} updated successfully`);
      return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_UPDATED(
        updatedDocument,
        id,
      );
    } catch (error) {
      this.logger.error(
        `Error updating property document with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while updating the property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertyDocumentById(id: number): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    try {
      const propertyDocument = await this.propertyDocumentsRepository.findOne({
        where: { id },
      });

      if (!propertyDocument) {
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_NOT_FOUND(id);
      }

      const s3Key = await this.s3UtilsService.extractS3Key(
        propertyDocument.documentUrl,
      );

      const headObject =
        await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
      if (!headObject) {
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_NOT_FOUND_IN_AWS_S3(
          s3Key,
        );
      }

      await this.s3UtilsService.deleteObjectFromS3(s3Key);

      const result = await this.propertyDocumentsRepository.delete(id);
      if (result.affected === 0) {
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_NOT_FOUND(id);
      }
      return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_DELETED(id);
    } catch (error) {
      this.logger.error(
        `Error deleting property document with ID ${id}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
