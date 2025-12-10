import { forwardRef, Module } from '@nestjs/common';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Bus, BusSchema } from 'src/modules/bus/bus.chema';
import { TripModule } from 'src/modules/trip/trip.module';
import { Trip, TripSchema } from 'src/modules/trip/trip.schema';

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
