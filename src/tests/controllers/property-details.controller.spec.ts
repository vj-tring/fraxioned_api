import { Test, TestingModule } from '@nestjs/testing';
import { PropertyDetailsController } from 'src/main/controller/property-details.controller';

describe('PropertyDetailsController', () => {
  let controller: PropertyDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyDetailsController],
    }).compile();

    controller = module.get<PropertyDetailsController>(
      PropertyDetailsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
