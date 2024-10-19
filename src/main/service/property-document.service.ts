import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerService } from './logger.service';
import { PROPERTY_DOCUMENTS_RESPONSES } from '../commons/constants/response-constants/property-document.constant';
import { S3UtilsService } from './s3-utils.service';
import { Property } from '../entities/property.entity';
import { User } from '../entities/user.entity';
import { CreatePropertyDocumentsDto } from '../dto/requests/property-document/create-property-document.dto';
import { UpdatePropertyDocumentDto } from '../dto/requests/property-document/update-property-document.dto';
import { PropertyDocuments } from '../entities/property-document.entity';
import { getMaxFileCount } from '../utils/image-file.utils';
import { ApiResponse } from '../commons/response-body/common.responses';

@Injectable()
export class PropertyDocumentsService {
  constructor(
    @InjectRepository(PropertyDocuments)
    private readonly propertyDocumentsRepository: Repository<PropertyDocuments>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3UtilsService: S3UtilsService,
    private readonly logger: LoggerService,
  ) {}

  async getDocumentCountForProperty(propertyId: number): Promise<number> {
    const documentCount = await this.propertyDocumentsRepository
      .createQueryBuilder('pd')
      .where('pd.property_id = :propertyId', { propertyId })
      .getCount();

    return documentCount;
  }

  async handleDocumentUploadLimitExceeded(
    maxFileCount: number,
    existingDocumentCount: number,
  ): Promise<ApiResponse<null>> {
    this.logger.error(
      `Maximum document upload limit exceeded. Only ${maxFileCount - existingDocumentCount} document(s) is/are allowed.`,
    );
    return PROPERTY_DOCUMENTS_RESPONSES.DOCUMENT_UPLOAD_LIMIT_EXCEEDED(
      maxFileCount,
      existingDocumentCount,
    );
  }

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

      const existingProperty = await this.propertyRepository.findOne({
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

      const existingDocumentCount =
        await this.getDocumentCountForProperty(propertyId);
      const maxFileCount = getMaxFileCount();

      if (
        existingDocumentCount + createPropertyDocumentsDtos.length >
        maxFileCount
      ) {
        return await this.handleDocumentUploadLimitExceeded(
          maxFileCount,
          existingDocumentCount,
        );
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
          property: existingProperty,
          createdBy: existingUser,
          documentName: dto.documentName,
          documentType: dto.documentType,
          documentUrl: documentUrlLocation,
        });

        return await this.propertyDocumentsRepository.save(newDocument);
      });

      const savedDocuments = await Promise.all(uploadPromises);
      this.logger.log(
        `${savedDocuments.length} property documents created successfully`,
      );
      return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_CREATED(
        savedDocuments,
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

  async findPropertyDocumentsByPropertyId(propertyId: number): Promise<{
    success: boolean;
    message: string;
    data?: PropertyDocuments[];
    statusCode: number;
  }> {
    try {
      const propertyDocuments = await this.propertyDocumentsRepository.find({
        relations: ['property', 'createdBy', 'updatedBy'],
        where: { property: { id: propertyId } },
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
        this.logger.log(
          `No property documents found for property ID ${propertyId}`,
        );
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_NOT_FOUND();
      }

      this.logger.log(
        `Retrieved ${propertyDocuments.length} property documents for property ID ${propertyId}`,
      );
      return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_FETCHED(
        propertyDocuments,
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving property documents for property ID ${propertyId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while retrieving property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePropertyDocument(
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
        where: { id },
        relations: ['property', 'createdBy', 'updatedBy'],
      });

      if (!propertyDocument) {
        this.logger.error(`Property Document with ID ${id} not found`);
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_NOT_FOUND(id);
      }

      if (updatePropertyDocumentDto.property) {
        const property = await this.propertyRepository.findOne({
          where: { id: updatePropertyDocumentDto.property.id },
        });
        if (!property) {
          return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_NOT_FOUND(
            updatePropertyDocumentDto.property.id,
          );
        }
      }

      if (updatePropertyDocumentDto.updatedBy) {
        const updatedByUser = await this.userRepository.findOne({
          where: { id: updatePropertyDocumentDto.updatedBy.id },
        });
        if (!updatedByUser) {
          return PROPERTY_DOCUMENTS_RESPONSES.USER_NOT_FOUND(
            updatePropertyDocumentDto.updatedBy.id,
          );
        }
      }

      let documentUrlLocation = propertyDocument.documentUrl;

      if (updatePropertyDocumentDto.documentFile) {
        const folderName = `properties_media/${propertyDocument.property.propertyName}/documents`;
        const fileName = updatePropertyDocumentDto.documentFile.originalname;

        let s3Key = '';
        if (documentUrlLocation) {
          s3Key = await this.s3UtilsService.extractS3Key(documentUrlLocation);
        }

        if (s3Key) {
          if (decodeURIComponent(s3Key) !== `${folderName}/${fileName}`) {
            const headObject =
              await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
            if (!headObject) {
              return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENT_NOT_FOUND_IN_AWS_S3(
                s3Key,
              );
            }
            await this.s3UtilsService.deleteObjectFromS3(s3Key);
          }
        }

        documentUrlLocation = await this.s3UtilsService.uploadFileToS3(
          folderName,
          fileName,
          updatePropertyDocumentDto.documentFile.buffer,
          updatePropertyDocumentDto.documentFile.mimetype,
        );

        this.logger.log(
          `New document uploaded successfully to S3 with URL: ${documentUrlLocation}`,
        );
      }

      const { documentFile, ...dtoWithoutDocumentFile } =
        updatePropertyDocumentDto;

      Object.assign(propertyDocument, {
        ...dtoWithoutDocumentFile,
        documentUrl: documentUrlLocation,
      });

      const updatedDocument =
        await this.propertyDocumentsRepository.save(propertyDocument);

      this.logger.log(
        `Property Document with ID ${id} updated successfully for the file ${documentFile}`,
      );
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

  async deletePropertyDocumentsByPropertyId(propertyId: number): Promise<void> {
    try {
      const propertyDocuments = await this.propertyDocumentsRepository.find({
        where: { property: { id: propertyId } },
      });

      if (propertyDocuments.length !== 0) {
        for (const propertyDocument of propertyDocuments) {
          let s3Key = '';
          const documentUrlLocation = propertyDocument.documentUrl;

          if (documentUrlLocation) {
            s3Key = await this.s3UtilsService.extractS3Key(documentUrlLocation);
          }
          if (s3Key) {
            const headObject =
              await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
            if (!headObject) {
              this.logger.warn(`Document not found in S3 for key: ${s3Key}`);
            } else {
              await this.s3UtilsService.deleteObjectFromS3(s3Key);
            }
          }
          await this.propertyDocumentsRepository.delete(propertyDocument.id);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error deleting property documents for Property ID ${propertyId}: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePropertyDocumentsByIds(ids: number[]): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
  }> {
    const notFoundIds: number[] = [];
    const s3NotFoundKeys: string[] = [];

    try {
      for (const id of ids) {
        const propertyDocument = await this.propertyDocumentsRepository.findOne(
          {
            where: { id },
          },
        );
        if (!propertyDocument) {
          notFoundIds.push(id);
          continue;
        }

        const s3Key = await this.s3UtilsService.extractS3Key(
          propertyDocument.documentUrl,
        );
        const headObject =
          await this.s3UtilsService.checkIfObjectExistsInS3(s3Key);
        if (!headObject) {
          s3NotFoundKeys.push(s3Key);
        }
      }

      if (notFoundIds.length > 0) {
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_NOT_FOUND_FOR_IDS(
          notFoundIds,
        );
      }

      if (s3NotFoundKeys.length > 0) {
        return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_NOT_FOUND_IN_AWS_S3(
          s3NotFoundKeys,
        );
      }

      for (const id of ids) {
        const propertyDocument = await this.propertyDocumentsRepository.findOne(
          { where: { id } },
        );
        const s3Key = await this.s3UtilsService.extractS3Key(
          propertyDocument.documentUrl,
        );

        await this.s3UtilsService.deleteObjectFromS3(s3Key);

        await this.propertyDocumentsRepository.delete(id);
      }
      return PROPERTY_DOCUMENTS_RESPONSES.PROPERTY_DOCUMENTS_BULK_DELETED();
    } catch (error) {
      this.logger.error(
        `Error deleting property documents with IDs [${ids.join(', ')}]: ${error.message} - ${error.stack}`,
      );
      throw new HttpException(
        'An error occurred while deleting the property documents',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
