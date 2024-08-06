import { Test, TestingModule } from '@nestjs/testing';
import { UserDocumentController } from 'src/main/controller/user-document.controller';
import { UserDocumentService } from 'services/user-document.service';
import { CreateUserDocumentDTO } from 'dto/requests/create-user-document.dto';
import { UpdateUserDocumentDTO } from 'dto/requests/update-user-document.dto';
import { AuthGuard } from 'commons/guards/auth.guard';
import { Reflector } from '@nestjs/core';
import { USER_DOCUMENT_RESPONSES } from 'src/main/commons/constants/response-constants/user-document.constant';
import { Properties } from 'src/main/entities/properties.entity';
import { User } from 'src/main/entities/user.entity';
import { UserDocument } from 'src/main/entities/user-documents.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerService } from 'src/main/service/logger.service';
import { AuthenticationService } from 'src/main/service/authentication.service';

describe('UserDocumentController', () => {
  let controller: UserDocumentController;
  let service: UserDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDocumentController],
      providers: [
        UserDocumentService,
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: AuthenticationService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserDocument),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Properties),
          useClass: Repository,
        },

        Reflector,
      ],
    }).compile();

    controller = module.get<UserDocumentController>(UserDocumentController);
    service = module.get<UserDocumentService>(UserDocumentService);
  });

  describe('createUserDocument', () => {
    it('should create a user document', async () => {
      const createUserDocumentDto: CreateUserDocumentDTO = {
        user: new User(),
        property: new Properties(),
        documentName: '',
        documentURL: '',
        createdBy: new User(),
      };

      jest
        .spyOn(service, 'createUserDocument')
        .mockResolvedValue(USER_DOCUMENT_RESPONSES.DOCUMENT_CREATED);

      const result = await controller.createUserDocument(createUserDocumentDto);
      expect(result).toEqual(USER_DOCUMENT_RESPONSES.DOCUMENT_CREATED);
    });
  });

  describe('getUserDocuments', () => {
    it('should return all user documents', async () => {
      const documents = [
        { id: 1, name: 'Document 1' } as unknown as UserDocument,
      ];
      jest
        .spyOn(service, 'getUserDocuments')
        .mockResolvedValue(
          USER_DOCUMENT_RESPONSES.DOCUMENTS_FETCHED(documents),
        );

      const result = await controller.getUserDocuments();
      expect(result).toEqual(
        USER_DOCUMENT_RESPONSES.DOCUMENTS_FETCHED(documents),
      );
    });
  });

  describe('getUserDocumentById', () => {
    it('should return a user document by ID', async () => {
      const document = { id: 1, name: 'Document 1' };
      jest
        .spyOn(service, 'getUserDocumentById')
        .mockResolvedValue(USER_DOCUMENT_RESPONSES.DOCUMENT_FETCHED(document));

      const result = await controller.getUserDocumentById(1);
      expect(result).toEqual(
        USER_DOCUMENT_RESPONSES.DOCUMENT_FETCHED(document),
      );
    });
  });

  describe('updateUserDocument', () => {
    it('should update a user document', async () => {
      const updateUserDocumentDto: UpdateUserDocumentDTO = {
        user: new User(),
        property: new Properties(),
        updatedBy: new User(),
      };

      const updatedDocument = { id: 1, name: 'Updated Document' };
      jest
        .spyOn(service, 'updateUserDocument')
        .mockResolvedValue(
          USER_DOCUMENT_RESPONSES.DOCUMENT_UPDATED(updatedDocument),
        );

      const result = await controller.updateUserDocument(
        1,
        updateUserDocumentDto,
      );
      expect(result).toEqual(
        USER_DOCUMENT_RESPONSES.DOCUMENT_UPDATED(updatedDocument),
      );
    });
  });

  describe('deleteUserDocument', () => {
    it('should delete a user document', async () => {
      jest
        .spyOn(service, 'deleteUserDocument')
        .mockResolvedValue(USER_DOCUMENT_RESPONSES.DOCUMENT_DELETED);

      const result = await controller.deleteUserDocument(1);
      expect(result).toEqual(USER_DOCUMENT_RESPONSES.DOCUMENT_DELETED);
    });
  });
});
