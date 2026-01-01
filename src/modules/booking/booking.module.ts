import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from 'src/modules/booking/booking.schema';
import { TripModule } from 'src/modules/trip/trip.module';
import { BusStopModule } from 'src/modules/bus-stop/bus-stop.module';
import { TripStopTimeModule } from 'src/modules/trip-stop-time/trip-stop-time.module';
import { TicketModule } from 'src/modules/ticket/ticket.module';
import { UserModule } from 'src/modules/user/user.module';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { HttpModule } from '@nestjs/axios';
import { MomoModule } from 'src/modules/momo/momo.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => TripModule),
    forwardRef(() => BusStopModule),
    forwardRef(() => TripStopTimeModule),
    forwardRef(() => TicketModule),
    forwardRef(() => PaymentModule),
    MomoModule,
  ],
  providers: [BookingService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
