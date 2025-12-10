import { forwardRef, Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from 'src/modules/trip/trip.schema';
import { BusModule } from 'src/modules/bus/bus.module';
import { TripRouteModule } from 'src/modules/trip-route/trip-route.module';
import { TripStopTimeModule } from 'src/modules/trip-stop-time/trip-stop-time.module';
import {
  TripStopTime,
  TripStopTimeSchema,
} from 'src/modules/trip-stop-time/trip-stop-time.schema';
import { Booking, BookingSchema } from 'src/modules/booking/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Trip.name, schema: TripSchema },
      { name: TripStopTime.name, schema: TripStopTimeSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    forwardRef(() => BusModule),
    TripRouteModule,
    forwardRef(() => TripStopTimeModule),
  ],
  providers: [TripService],
  controllers: [TripController],
  exports: [TripService],
})
export class TripModule {}
