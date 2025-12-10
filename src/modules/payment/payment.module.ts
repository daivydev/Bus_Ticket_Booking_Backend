import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/modules/payment/payment.schema';
import { BookingModule } from 'src/modules/booking/booking.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    BookingModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
