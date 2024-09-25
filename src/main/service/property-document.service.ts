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

  // Implement other methods (findAll, findById, update, delete) here
}
