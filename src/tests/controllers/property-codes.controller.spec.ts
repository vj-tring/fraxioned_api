import { Test, TestingModule } from '@nestjs/testing';
import { PropertyCodesController } from '../../main/controller/property-codes.controller';
import { PropertyCodesService } from './property-codes.service';

describe('PropertyCodesController', () => {
  let controller: PropertyCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyCodesController],
      providers: [PropertyCodesService],
    }).compile();

    controller = module.get<PropertyCodesController>(PropertyCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
