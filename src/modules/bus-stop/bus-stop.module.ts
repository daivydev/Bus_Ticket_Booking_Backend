import { forwardRef, Module } from '@nestjs/common';
import { BusStopController } from './bus-stop.controller';
import { BusStopService } from './bus-stop.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BusStop, BusStopSchema } from 'src/modules/bus-stop/bus-stop.schema';
import { CityModule } from 'src/modules/city/city.module';
import { BusModule } from 'src/modules/bus/bus.module';
import { Booking, BookingSchema } from 'src/modules/booking/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BusStop.name, schema: BusStopSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    forwardRef(() => CityModule),
    forwardRef(() => BusModule),
  ],
  controllers: [BusStopController],
  providers: [BusStopService],
  exports: [BusStopService],
})
export class BusStopModule {}
