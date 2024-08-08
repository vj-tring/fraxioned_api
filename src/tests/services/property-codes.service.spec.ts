import { Test, TestingModule } from '@nestjs/testing';
import { PropertyCodesService } from './property-codes.service';

describe('PropertyCodesService', () => {
  let service: PropertyCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyCodesService],
    }).compile();

    service = module.get<PropertyCodesService>(PropertyCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
