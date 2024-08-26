import { DataSource } from 'typeorm';
import { seedRole } from 'src/main/commons/seeds/roleSeed';
import { seedUser } from 'src/main/commons/seeds/userSeed';
import { seedProperties } from 'src/main/commons/seeds/propertySeed';
import { seedPropertyDetails } from 'src/main/commons/seeds/propertDetailSeed';
import { seedUserPropertyDetails } from 'src/main/commons/seeds/userPropertyDetailsSeed';
import { Role } from 'src/main/entities/role.entity';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { PropertyDetails } from 'src/main/entities/property-details.entity';
import { UserContactDetails } from 'src/main/entities/user-contact-details.entity';

jest.mock('typeorm', () => {
  const actualTypeorm = jest.requireActual('typeorm');
  return {
    ...actualTypeorm,
    DataSource: jest.fn().mockImplementation(() => ({
      getRepository: jest.fn(),
      initialize: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('Seed Functions', () => {
  let dataSource: DataSource;

  beforeEach(() => {
    dataSource = new DataSource({ type: 'sqlite', database: ':memory:' });
  });

  describe('seedRole', () => {
    it('should seed roles if no roles exist', async () => {
      const roleRepository = {
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue(undefined),
      };
      const userRepository = {
        findOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      dataSource.getRepository = jest.fn().mockImplementation((entity) => {
        if (entity === Role) return roleRepository;
        if (entity === User) return userRepository;
      });

      await seedRole(dataSource);

      expect(roleRepository.find).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should not seed roles if roles already exist', async () => {
      const roleRepository = {
        find: jest.fn().mockResolvedValue([{ id: 1 }]),
        save: jest.fn(),
      };
      dataSource.getRepository = jest.fn().mockReturnValue(roleRepository);

      await seedRole(dataSource);

      expect(roleRepository.find).toHaveBeenCalled();
      expect(roleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('seedUser', () => {
    it('should seed users if no users exist', async () => {
      const userRepository = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((user) => user),
        save: jest.fn().mockResolvedValue(undefined),
        findOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      const roleRepository = {
        findOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      const userContactDetailsRepository = {
        create: jest.fn().mockImplementation((details) => details),
        save: jest.fn().mockResolvedValue(undefined),
      };
      dataSource.getRepository = jest.fn().mockImplementation((entity) => {
        if (entity === User) return userRepository;
        if (entity === Role) return roleRepository;
        if (entity === UserContactDetails) return userContactDetailsRepository;
      });

      await seedUser(dataSource);

      expect(userRepository.find).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(userContactDetailsRepository.save).toHaveBeenCalled();
    });

    it('should not seed users if users already exist', async () => {
      const userRepository = {
        find: jest.fn().mockResolvedValue([{ id: 1 }]),
        save: jest.fn(),
        findOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      const roleRepository = {
        findOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      dataSource.getRepository = jest.fn().mockImplementation((entity) => {
        if (entity === User) return userRepository;
        if (entity === Role) return roleRepository;
      });

      await seedUser(dataSource);

      expect(userRepository.find).toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('seedProperties', () => {
    it('should seed properties if no properties exist', async () => {
      const propertiesRepository = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((property) => property),
        save: jest.fn().mockResolvedValue(undefined),
      };
      const userRepository = {
        findOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      dataSource.getRepository = jest.fn().mockImplementation((entity) => {
        if (entity === Property) return propertiesRepository;
        if (entity === User) return userRepository;
      });

      await seedProperties(dataSource);

      expect(propertiesRepository.find).toHaveBeenCalled();
      expect(propertiesRepository.save).toHaveBeenCalled();
    });
  });

  describe('seedPropertyDetails', () => {
    it('should seed property details if no property details exist', async () => {
      const propertyDetailsRepository = {
        find: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockImplementation((details) => details),
        save: jest.fn().mockResolvedValue(undefined),
      };
      const userRepository = {
        findOne: jest.fn().mockResolvedValue({ id: 1 }),
      };
      dataSource.getRepository = jest.fn().mockImplementation((entity) => {
        if (entity === PropertyDetails) return propertyDetailsRepository;
        if (entity === User) return userRepository;
      });

      await seedPropertyDetails(dataSource);

      expect(propertyDetailsRepository.find).toHaveBeenCalled();
      expect(propertyDetailsRepository.save).toHaveBeenCalled();
    });
  });

  describe('seedUserPropertyDetails', () => {
    it('should seed user property details if no user property details exist', async () => {
      const userPropertyDetailsRepository = {
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue(undefined),
      };
      dataSource.getRepository = jest
        .fn()
        .mockReturnValue(userPropertyDetailsRepository);

      await seedUserPropertyDetails(dataSource);

      expect(userPropertyDetailsRepository.find).toHaveBeenCalled();
      expect(userPropertyDetailsRepository.save).toHaveBeenCalled();
    });
  });
});
