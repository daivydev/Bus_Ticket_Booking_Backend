import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { BookingModule } from './modules/booking/booking.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { PaymentModule } from './modules/payment/payment.module';
import { TripModule } from './modules/trip/trip.module';
import { BusModule } from './modules/bus/bus.module';
import { TripRouteModule } from './modules/trip-route/trip-route.module';
import { CityModule } from './modules/city/city.module';
import { BusStopModule } from './modules/bus-stop/bus-stop.module';
import { TripStopTimeModule } from './modules/trip-stop-time/trip-stop-time.module';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URI as string),
    // MongooseModule.forRoot('mongodb://localhost:27017/TripGO'),
    UserModule,
    BookingModule,
    TicketModule,
    PaymentModule,
    TripModule,
    BusModule,
    TripRouteModule,
    CityModule,
    BusStopModule,
    TripStopTimeModule,
    AuthModule,
    TripRouteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
