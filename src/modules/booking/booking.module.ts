import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../booking/booking.schema';
import { TripModule } from '../trip/trip.module';
import { BusStopModule } from '../bus-stop/bus-stop.module';
import { TripStopTimeModule } from '../trip-stop-time/trip-stop-time.module';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../user/user.module';
import { PaymentModule } from '../payment/payment.module';
import { HttpModule } from '@nestjs/axios';
import { MomoModule } from '../momo/momo.module';
import { VnpayModule } from '../vnpay/vnpay.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    forwardRef(() => UserModule),
    forwardRef(() => TripModule),
    forwardRef(() => BusStopModule),
    forwardRef(() => TripStopTimeModule),
    forwardRef(() => TicketModule),
    forwardRef(() => PaymentModule),
    VnpayModule,
  ],
  providers: [BookingService],
  controllers: [BookingController],
  exports: [BookingService],
})
export class BookingModule {}
