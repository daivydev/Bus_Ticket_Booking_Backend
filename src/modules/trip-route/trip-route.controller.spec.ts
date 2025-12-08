import { Test, TestingModule } from '@nestjs/testing';
import { TripRouteController } from './trip-route.controller';

describe('TripRouteController', () => {
  let controller: TripRouteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripRouteController],
    }).compile();

    controller = module.get<TripRouteController>(TripRouteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
