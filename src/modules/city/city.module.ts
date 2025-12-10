import { forwardRef, Module } from '@nestjs/common';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from 'src/modules/city/city.schema';
import { BusStopModule } from 'src/modules/bus-stop/bus-stop.module';
import { TripRouteModule } from 'src/modules/trip-route/trip-route.module';
import { BusStop, BusStopSchema } from 'src/modules/bus-stop/bus-stop.schema';
import { Route, RouteSchema } from 'src/modules/trip-route/trip-route.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: City.name, schema: CitySchema },
      { name: BusStop.name, schema: BusStopSchema },
      { name: Route.name, schema: RouteSchema },
    ]),
    forwardRef(() => BusStopModule),
    forwardRef(() => TripRouteModule),
  ],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
