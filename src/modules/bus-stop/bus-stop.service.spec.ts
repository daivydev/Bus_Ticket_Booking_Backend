import { Test, TestingModule } from '@nestjs/testing';
import { BusStopService } from './bus-stop.service';

describe('BusStopService', () => {
  let service: BusStopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusStopService],
    }).compile();

    service = module.get<BusStopService>(BusStopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
