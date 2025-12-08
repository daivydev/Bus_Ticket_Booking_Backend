import { Test, TestingModule } from '@nestjs/testing';
import { TripStopTimeService } from './trip-stop-time.service';

describe('TripStopTimeService', () => {
  let service: TripStopTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripStopTimeService],
    }).compile();

    service = module.get<TripStopTimeService>(TripStopTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
