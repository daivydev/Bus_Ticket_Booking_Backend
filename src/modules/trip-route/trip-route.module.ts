import { forwardRef, Module } from '@nestjs/common';
import { TripRouteController } from './trip-route.controller';
import { TripRouteService } from './trip-route.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Route, RouteSchema } from 'src/modules/trip-route/trip-route.schema';
import { CityModule } from 'src/modules/city/city.module';
import { TripModule } from 'src/modules/trip/trip.module';
import { Trip, TripSchema } from 'src/modules/trip/trip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Route.name, schema: RouteSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
    CityModule,
    forwardRef(() => TripModule),
  ],
  controllers: [TripRouteController],
  providers: [TripRouteService],
  exports: [TripRouteService],
})
export class TripRouteModule {}
