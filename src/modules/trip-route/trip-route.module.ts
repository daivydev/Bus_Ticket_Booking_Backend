import { Module } from '@nestjs/common';
import { TripRouteController } from './trip-route.controller';
import { TripRouteService } from './trip-route.service';

@Module({
  controllers: [TripRouteController],
  providers: [TripRouteService],
})
export class TripRouteModule {}
