import { forwardRef, Module } from '@nestjs/common';
import { TripStopTimeService } from './trip-stop-time.service';
import { TripStopTimeController } from './trip-stop-time.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TripStopTime,
  TripStopTimeSchema,
} from '../trip-stop-time/trip-stop-time.schema';
import { TripModule } from '../trip/trip.module';
import { BusStopModule } from '../bus-stop/bus-stop.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TripStopTime.name, schema: TripStopTimeSchema },
    ]),
    forwardRef(() => TripModule),
    forwardRef(() => BusStopModule),
  ],
  providers: [TripStopTimeService],
  controllers: [TripStopTimeController],
  exports: [TripStopTimeService],
})
export class TripStopTimeModule {}
