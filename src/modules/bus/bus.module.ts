import { forwardRef, Module } from '@nestjs/common';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Bus, BusSchema } from '../bus/bus.chema';
import { TripModule } from '../trip/trip.module';
import { Trip, TripSchema } from '../trip/trip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bus.name, schema: BusSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
  ],
  controllers: [BusController],
  providers: [BusService],
  exports: [BusService],
})
export class BusModule {}
