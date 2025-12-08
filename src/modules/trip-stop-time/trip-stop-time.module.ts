import { Module } from '@nestjs/common';
import { TripStopTimeService } from './trip-stop-time.service';
import { TripStopTimeController } from './trip-stop-time.controller';

@Module({
  providers: [TripStopTimeService],
  controllers: [TripStopTimeController]
})
export class TripStopTimeModule {}
