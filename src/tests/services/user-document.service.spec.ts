import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDocument } from 'entities/user-documents.entity';
import { User } from 'entities/user.entity';
import { Property } from 'entities/property.entity';
import { LoggerService } from 'services/logger.service';
import { Repository } from 'typeorm';
import { UpdateUserDocumentDTO } from 'src/main/dto/requests/user-document/update-user-document.dto';
import { USER_DOCUMENT_RESPONSES } from 'src/main/commons/constants/response-constants/user-document.constant';
import { USER_RESPONSES } from 'src/main/commons/constants/response-constants/user.constant';
import { Role } from 'src/main/entities/role.entity';
import { UserDocumentService } from 'src/main/service/user-document.service';
import { CreateUserDocumentDTO } from 'src/main/dto/requests/user-document/create-user-document.dto';

describe('UserDocumentService', () => {
  let service: UserDocumentService;
  let userDocumentRepository: Repository<UserDocument>;
  let userRepository: Repository<User>;
  let propertyRepository: Repository<Property>;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDocumentService,
        {
          provide: getRepositoryToken(UserDocument),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserDocumentService>(UserDocumentService);
    userDocumentRepository = module.get<Repository<UserDocument>>(
      getRepositoryToken(UserDocument),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    logger = module.get<LoggerService>(LoggerService);
  });

  describe('createUserDocument', () => {
    it('should create a user document successfully', async () => {
      const createUserDocumentDto: CreateUserDocumentDTO = {
        user: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
          contactDetails: {
            id: 0,
            user: new User(),
            primaryEmail: '',
            secondaryEmail: '',
            optionalEmailOne: '',
            optionalEmailTwo: '',
            primaryPhone: '',
            secondaryPhone: '',
            optionalPhoneOne: '',
            optionalPhoneTwo: '',
            createdBy: new User(),
            updatedBy: new User(),
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
        property: {
          id: 1,
          propertyName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipcode: 0,
          houseDescription: '',
          isExclusive: false,
          propertyShare: 0,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
          latitude: 0,
          longitude: 0,
          isActive: false,
          displayOrder: 0,
        } as Property,
        createdBy: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
          contactDetails: {
            id: 0,
            user: new User(),
            primaryEmail: '',
            secondaryEmail: '',
            optionalEmailOne: '',
            optionalEmailTwo: '',
            primaryPhone: '',
            secondaryPhone: '',
            optionalPhoneOne: '',
            optionalPhoneTwo: '',
            createdBy: new User(),
            updatedBy: new User(),
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
        documentName: '',
        documentURL: '',
      };

      const user = { id: 1 } as User;
      const property = { id: 1 } as Property;
      const createdBy = { id: 1 } as User;
      const savedDocument = { id: 1 } as UserDocument;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(createdBy);
      jest
        .spyOn(userDocumentRepository, 'create')
        .mockReturnValue(savedDocument as unknown as UserDocument);
      jest
        .spyOn(userDocumentRepository, 'save')
        .mockResolvedValueOnce(savedDocument);

      const result = await service.createUserDocument(createUserDocumentDto);

      expect(result).toEqual(
        USER_DOCUMENT_RESPONSES.DOCUMENT_CREATED(savedDocument),
      );
      expect(logger.log).toHaveBeenCalledWith(
        `Document created with ID ${savedDocument.id}`,
      );
    });

    it('should return USER_NOT_FOUND if user is not found', async () => {
      const createUserDocumentDto: CreateUserDocumentDTO = {
        user: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
          contactDetails: {
            id: 0,
            user: new User(),
            primaryEmail: '',
            secondaryEmail: '',
            optionalEmailOne: '',
            optionalEmailTwo: '',
            primaryPhone: '',
            secondaryPhone: '',
            optionalPhoneOne: '',
            optionalPhoneTwo: '',
            createdBy: new User(),
            updatedBy: new User(),
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
        property: {
          id: 1,
          propertyName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipcode: 0,
          houseDescription: '',
          isExclusive: false,
          propertyShare: 0,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
          latitude: 0,
          longitude: 0,
          isActive: false,
          displayOrder: 0,
        } as Property,
        createdBy: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
          contactDetails: {
            id: 0,
            user: new User(),
            primaryEmail: '',
            secondaryEmail: '',
            optionalEmailOne: '',
            optionalEmailTwo: '',
            primaryPhone: '',
            secondaryPhone: '',
            optionalPhoneOne: '',
            optionalPhoneTwo: '',
            createdBy: new User(),
            updatedBy: new User(),
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
        documentName: '',
        documentURL: '',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.createUserDocument(createUserDocumentDto);

      expect(result).toEqual(
        USER_RESPONSES.USER_NOT_FOUND(createUserDocumentDto.user.id),
      );
    });
  });

  describe('getUserDocuments', () => {
    it('should fetch all user documents successfully', async () => {
      const documents = [{ id: 1 } as UserDocument, { id: 2 } as UserDocument];

      jest
        .spyOn(userDocumentRepository, 'find')
        .mockResolvedValueOnce(documents);

      const result = await service.getUserDocuments();

      expect(result).toEqual(
        USER_DOCUMENT_RESPONSES.DOCUMENTS_FETCHED(documents),
      );
      expect(logger.log).toHaveBeenCalledWith('Fetching all documents');
    });

    it('should return DOCUMENTS_NOT_FOUND if no documents are found', async () => {
      jest.spyOn(userDocumentRepository, 'find').mockResolvedValueOnce([]);

      const result = await service.getUserDocuments();

      expect(result).toEqual(USER_DOCUMENT_RESPONSES.DOCUMENTS_NOT_FOUND());
      expect(logger.warn).toHaveBeenCalledWith('No documents found');
    });
  });

  describe('getUserDocumentById', () => {
    it('should fetch a user document by ID successfully', async () => {
      const document = { id: 1 } as UserDocument;

      jest
        .spyOn(userDocumentRepository, 'findOne')
        .mockResolvedValueOnce(document);

      const result = await service.getUserDocumentById(1);

      expect(result).toEqual(
        USER_DOCUMENT_RESPONSES.DOCUMENT_FETCHED(document),
      );
      expect(logger.log).toHaveBeenCalledWith('Fetching document with ID 1');
    });

    it('should return DOCUMENT_NOT_FOUND if document is not found', async () => {
      jest.spyOn(userDocumentRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.getUserDocumentById(1);

      expect(result).toEqual(USER_DOCUMENT_RESPONSES.DOCUMENT_NOT_FOUND(1));
      expect(logger.warn).toHaveBeenCalledWith('Document with ID 1 not found');
    });
  });

  describe('updateUserDocument', () => {
    it('should update a user document successfully', async () => {
      const updateUserDocumentDto: UpdateUserDocumentDTO = {
        user: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
          contactDetails: {
            id: 0,
            user: new User(),
            primaryEmail: '',
            secondaryEmail: '',
            optionalEmailOne: '',
            optionalEmailTwo: '',
            primaryPhone: '',
            secondaryPhone: '',
            optionalPhoneOne: '',
            optionalPhoneTwo: '',
            createdBy: new User(),
            updatedBy: new User(),
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
        property: {
          id: 1,
          propertyName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipcode: 0,
          houseDescription: '',
          isExclusive: false,
          propertyShare: 0,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
          latitude: 0,
          longitude: 0,
          isActive: false,
          displayOrder: 0,
        } as Property,
        updatedBy: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
          contactDetails: {
            id: 0,
            user: new User(),
            primaryEmail: '',
            secondaryEmail: '',
            optionalEmailOne: '',
            optionalEmailTwo: '',
            primaryPhone: '',
            secondaryPhone: '',
            optionalPhoneOne: '',
            optionalPhoneTwo: '',
            createdBy: new User(),
            updatedBy: new User(),
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
      };

      const document = { id: 1 } as UserDocument;
      const user = { id: 1 } as User;
      const property = { id: 1 } as Property;
      const updatedBy = { id: 1 } as User;
      const updatedDocument = { id: 1 } as UserDocument;

      jest
        .spyOn(userDocumentRepository, 'findOne')
        .mockResolvedValueOnce(document);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(propertyRepository, 'findOne').mockResolvedValueOnce(property);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(updatedBy);
      jest
        .spyOn(userDocumentRepository, 'save')
        .mockResolvedValueOnce(updatedDocument);

      const result = await service.updateUserDocument(1, updateUserDocumentDto);

      expect(result).toEqual(
        USER_DOCUMENT_RESPONSES.DOCUMENT_UPDATED(updatedDocument),
      );
      expect(logger.log).toHaveBeenCalledWith('Document with ID 1 updated');
    });

    it('should return DOCUMENT_NOT_FOUND if document is not found', async () => {
      const updateUserDocumentDto: UpdateUserDocumentDTO = {
        user: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
          contactDetails: {
            id: 0,
            user: new User(),
            primaryEmail: '',
            secondaryEmail: '',
            optionalEmailOne: '',
            optionalEmailTwo: '',
            primaryPhone: '',
            secondaryPhone: '',
            optionalPhoneOne: '',
            optionalPhoneTwo: '',
            createdBy: new User(),
            updatedBy: new User(),
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
        property: {
          id: 1,
          propertyName: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipcode: 0,
          houseDescription: '',
          isExclusive: false,
          propertyShare: 0,
          createdBy: new User(),
          updatedBy: new User(),
          createdAt: undefined,
          updatedAt: undefined,
          latitude: 0,
          longitude: 0,
          isActive: false,
          displayOrder: 0,
        } as Property,
        updatedBy: {
          id: 1,
          role: new Role(),
          firstName: '',
          lastName: '',
          password: '',
          imageURL: '',
          isActive: false,
          addressLine1: '',
          addressLine2: '',
          state: '',
          country: '',
          city: '',
          zipcode: '',
          resetToken: '',
          resetTokenExpires: undefined,
          lastLoginTime: undefined,
          createdBy: 0,
          updatedBy: 0,
          createdAt: undefined,
          updatedAt: undefined,
          contactDetails: {
            id: 0,
            user: new User(),
            primaryEmail: '',
            secondaryEmail: '',
            optionalEmailOne: '',
            optionalEmailTwo: '',
            primaryPhone: '',
            secondaryPhone: '',
            optionalPhoneOne: '',
            optionalPhoneTwo: '',
            createdBy: new User(),
            updatedBy: new User(),
            createdAt: undefined,
            updatedAt: undefined,
          },
        },
      };

      jest.spyOn(userDocumentRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.updateUserDocument(1, updateUserDocumentDto);

      expect(result).toEqual(USER_DOCUMENT_RESPONSES.DOCUMENT_NOT_FOUND(1));
      expect(logger.warn).toHaveBeenCalledWith('Document with ID 1 not found');
    });
  });

  describe('deleteUserDocument', () => {
    it('should delete a user document successfully', async () => {
      const document = { id: 1 } as UserDocument;

      jest
        .spyOn(userDocumentRepository, 'findOne')
        .mockResolvedValueOnce(document);
      jest.spyOn(userDocumentRepository, 'delete').mockResolvedValueOnce(null);

      const result = await service.deleteUserDocument(1);

      expect(result).toEqual(USER_DOCUMENT_RESPONSES.DOCUMENT_DELETED);
      expect(logger.log).toHaveBeenCalledWith('Document with ID 1 deleted');
    });

    it('should return DOCUMENT_NOT_FOUND if document is not found', async () => {
      jest.spyOn(userDocumentRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await service.deleteUserDocument(1);

      expect(result).toEqual(USER_DOCUMENT_RESPONSES.DOCUMENT_NOT_FOUND(1));
      expect(logger.warn).toHaveBeenCalledWith('Document with ID 1 not found');
    });
  });
});
