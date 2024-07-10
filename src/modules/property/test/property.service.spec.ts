import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from '../property.service';
import { Property } from '../../owner-property/entity/property.entity';
import { PropertyPhoto } from '../../owner-property/entity/property-photo.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('PropertyService', () => {
  let service: PropertyService;
  let propertyRepository: Repository<Property>;
  let propertyPhotoRepository: Repository<PropertyPhoto>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        {
          provide: getRepositoryToken(Property),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PropertyPhoto),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    propertyRepository = module.get<Repository<Property>>(
      getRepositoryToken(Property),
    );
    propertyPhotoRepository = module.get<Repository<PropertyPhoto>>(
      getRepositoryToken(PropertyPhoto),
    );
  });

  describe('getPropertyDetailsById', () => {
    it('should return property details including photos', async () => {
      const propertyId = 1;
      const property: Property = {
        id: propertyId,
        name: 'Test Property',
        address: '123 Test St',
        photos: [
          {
            id: 1,
            image_url: 'http://example.com/photo1.jpg',
            property: null,
          } as PropertyPhoto,
          {
            id: 2,
            image_url: 'http://example.com/photo2.jpg',
            property: null,
          } as PropertyPhoto,
        ],
      } as Property;

      jest.spyOn(propertyRepository, 'createQueryBuilder').mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(property),
      } as any);

      const result = await service.getPropertyDetailsById(propertyId);
      expect(result).toEqual(property);
    });
  });

  describe('getPropertyPhotosByPropertyId', () => {
    it('should return property photos', async () => {
      const propertyId = 1;
      const photos: PropertyPhoto[] = [
        {
          id: 1,
          image_url: 'http://example.com/photo1.jpg',
          property: null,
        } as PropertyPhoto,
        {
          id: 2,
          image_url: 'http://example.com/photo2.jpg',
          property: null,
        } as PropertyPhoto,
      ];

      jest.spyOn(propertyPhotoRepository, 'find').mockResolvedValue(photos);

      const result = await service.getPropertyPhotosByPropertyId(propertyId);
      expect(result).toEqual(photos);
      expect(propertyPhotoRepository.find).toHaveBeenCalledWith({
        where: { property: { id: propertyId } },
      });
    });
  });
});
