import { Test, TestingModule } from '@nestjs/testing';
import { PropertyDetailsService } from 'src/main/service/property-details.service';

describe('PropertyDetailsService', () => {
  let service: PropertyDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyDetailsService],
    }).compile();

    service = module.get<PropertyDetailsService>(PropertyDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
