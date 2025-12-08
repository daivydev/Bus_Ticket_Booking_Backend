import { Test, TestingModule } from '@nestjs/testing';
import { TripStopTimeController } from './trip-stop-time.controller';

describe('TripStopTimeController', () => {
  let controller: TripStopTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripStopTimeController],
    }).compile();

    controller = module.get<TripStopTimeController>(TripStopTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
