import { Test, TestingModule } from '@nestjs/testing';
import { PropertyController } from '../property.controller';
import { PropertyService } from '../property.service';
import { Property } from '../../owner-property/entity/property.entity';
import { PropertyPhoto } from '../../owner-property/entity/property-photo.entity';

describe('PropertyController', () => {
  let controller: PropertyController;
  let service: PropertyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyController],
      providers: [
        {
          provide: PropertyService,
          useValue: {
            getPropertyDetailsById: jest.fn(),
            getPropertyPhotosByPropertyId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PropertyController>(PropertyController);
    service = module.get<PropertyService>(PropertyService);
  });

  describe('getPropertyDetails', () => {
    it('should return property details', async () => {
      const propertyId = 1;
      const property: Property = {
        id: propertyId,
        name: 'Test Property',
        address: '123 Test St',
        // other property fields...
      } as Property;

      jest.spyOn(service, 'getPropertyDetailsById').mockResolvedValue(property);

      expect(await controller.getPropertyDetails(propertyId)).toBe(property);
      expect(service.getPropertyDetailsById).toHaveBeenCalledWith(propertyId);
    });
  });

  describe('getPropertyPhotos', () => {
    it('should return property photos', async () => {
      const propertyId = 1;
      const photos: PropertyPhoto[] = [
        {
          id: 1,
          image_url: 'test',
          property: new Property(),
        },
        {
          id: 2,
          image_url: 'test',
          property: new Property(),
        },
      ];

      jest
        .spyOn(service, 'getPropertyPhotosByPropertyId')
        .mockResolvedValue(photos);

      expect(await controller.getPropertyPhotos(propertyId)).toBe(photos);
      expect(service.getPropertyPhotosByPropertyId).toHaveBeenCalledWith(
        propertyId,
      );
    });
  });
});
