import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDocument } from 'entities/user-documents.entity';
import { LoggerService } from 'services/logger.service';
import { USER_DOCUMENT_RESPONSES } from 'src/main/commons/constants/response-constants/user-document.constant';
import { UpdateUserDocumentDTO } from 'src/main/dto/requests/user-document/update-user-document.dto';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { USER_RESPONSES } from '../commons/constants/response-constants/user.constant';
import { USER_PROPERTY_RESPONSES } from '../commons/constants/response-constants/user-property.constant';
import { CreateUserDocumentDTO } from '../dto/requests/user-document/create-user-document.dto';

@Injectable()
export class UserDocumentService {
  constructor(
    @InjectRepository(UserDocument)
    private readonly userDocumentRepository: Repository<UserDocument>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly logger: LoggerService,
  ) {}

  async createUserDocument(
    createUserDocumentDto: CreateUserDocumentDTO,
  ): Promise<object> {
    const user = await this.userRepository.findOne({
      where: { id: createUserDocumentDto.user.id },
    });
    if (!user) {
      return USER_RESPONSES.USER_NOT_FOUND(createUserDocumentDto.user.id);
    }

    const property = await this.propertyRepository.findOne({
      where: { id: createUserDocumentDto.property.id },
    });
    if (!property) {
      return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(
        createUserDocumentDto.property.id,
      );
    }

    const createdBy = await this.userRepository.findOne({
      where: { id: createUserDocumentDto.createdBy.id },
    });
    if (!createdBy) {
      return USER_RESPONSES.USER_NOT_FOUND(createUserDocumentDto.createdBy.id);
    }

    const document = this.userDocumentRepository.create({
      ...createUserDocumentDto,
      user,
      property,
    });

    const savedDocument = await this.userDocumentRepository.save(document);
    this.logger.log(`Document created with ID ${savedDocument.id}`);
    return USER_DOCUMENT_RESPONSES.DOCUMENT_CREATED(savedDocument);
  }

  async getUserDocuments(): Promise<object> {
    this.logger.log('Fetching all documents');
    const documents = await this.userDocumentRepository.find({
      relations: ['user', 'property'],
      select: {
        user: { id: true },
        property: { id: true },
      },
    });
    if (documents.length === 0) {
      this.logger.warn('No documents found');
      return USER_DOCUMENT_RESPONSES.DOCUMENTS_NOT_FOUND();
    }
    return USER_DOCUMENT_RESPONSES.DOCUMENTS_FETCHED(documents);
  }

  async getUserDocumentById(id: number): Promise<object> {
    this.logger.log(`Fetching document with ID ${id}`);
    const document = await this.userDocumentRepository.findOne({
      where: { id },
      relations: ['user', 'property'],
      select: {
        user: { id: true },
        property: { id: true },
      },
    });
    if (!document) {
      this.logger.warn(`Document with ID ${id} not found`);
      return USER_DOCUMENT_RESPONSES.DOCUMENT_NOT_FOUND(id);
    }
    return USER_DOCUMENT_RESPONSES.DOCUMENT_FETCHED(document);
  }

  async updateUserDocument(
    id: number,
    updateUserDocumentDto: UpdateUserDocumentDTO,
  ): Promise<object> {
    const document = await this.userDocumentRepository.findOne({
      where: { id },
      relations: ['user', 'property'],
    });
    if (!document) {
      this.logger.warn(`Document with ID ${id} not found`);
      return USER_DOCUMENT_RESPONSES.DOCUMENT_NOT_FOUND(id);
    }

    if (updateUserDocumentDto.user.id) {
      const user = await this.userRepository.findOne({
        where: { id: updateUserDocumentDto.user.id },
      });
      if (!user) {
        return USER_RESPONSES.USER_NOT_FOUND(updateUserDocumentDto.user.id);
      }
      document.user = user;
    }

    if (updateUserDocumentDto.property.id) {
      const property = await this.propertyRepository.findOne({
        where: { id: updateUserDocumentDto.property.id },
      });
      if (!property) {
        return USER_PROPERTY_RESPONSES.PROPERTY_NOT_FOUND(
          updateUserDocumentDto.property.id,
        );
      }
      document.property = property;
    }

    if (updateUserDocumentDto.updatedBy.id) {
      const updatedBy = await this.userRepository.findOne({
        where: { id: updateUserDocumentDto.updatedBy.id },
      });
      if (!updatedBy) {
        return USER_RESPONSES.USER_NOT_FOUND(
          updateUserDocumentDto.updatedBy.id,
        );
      }
      document.updatedBy = updatedBy;
    }

    Object.assign(document, updateUserDocumentDto);
    const updatedDocument = await this.userDocumentRepository.save(document);
    this.logger.log(`Document with ID ${id} updated`);
    return USER_DOCUMENT_RESPONSES.DOCUMENT_UPDATED(updatedDocument);
  }

  async deleteUserDocument(id: number): Promise<object> {
    const document = await this.userDocumentRepository.findOne({
      where: { id },
    });
    if (!document) {
      this.logger.warn(`Document with ID ${id} not found`);
      return USER_DOCUMENT_RESPONSES.DOCUMENT_NOT_FOUND(id);
    }

    await this.userDocumentRepository.delete({ id });
    this.logger.log(`Document with ID ${id} deleted`);
    return USER_DOCUMENT_RESPONSES.DOCUMENT_DELETED;
  }
}
