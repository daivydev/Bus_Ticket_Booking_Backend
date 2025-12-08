import { Test, TestingModule } from '@nestjs/testing';
import { TripRouteService } from './trip-route.service';

describe('TripRouteService', () => {
  let service: TripRouteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripRouteService],
    }).compile();

    service = module.get<TripRouteService>(TripRouteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
