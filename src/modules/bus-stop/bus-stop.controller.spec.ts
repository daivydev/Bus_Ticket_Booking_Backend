import { Test, TestingModule } from '@nestjs/testing';
import { BusStopController } from './bus-stop.controller';

describe('BusStopController', () => {
  let controller: BusStopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusStopController],
    }).compile();

    controller = module.get<BusStopController>(BusStopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
