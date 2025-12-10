import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Booking } from '../booking/booking.schema'; // FK: Booking

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
  Success = 'Success',
  Failed = 'Failed',
  Pending = 'Pending',
}

@Schema({
  timestamps: true, // transactionDate sẽ được quản lý bởi timestamps.createdAt
  versionKey: false,
})
export class Payment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Booking.name,
    required: true,
    unique: true, // Đảm bảo mỗi Booking chỉ có 1 bản ghi Payment chính
  })
  bookingId: MongooseSchema.Types.ObjectId;

  // Phương thức thanh toán (ví dụ: Credit Card, Momo, ZaloPay, Bank Transfer)
  @Prop({ required: true, type: String, maxlength: 50 })
  paymentMethod: string;

  // Số tiền đã thanh toán
  @Prop({ required: true, type: Number, min: 0 })
  amountPaid: number;

  // Trạng thái thanh toán
  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.Pending,
    required: true,
  })
  paymentStatus: PaymentStatus;

  // Mã tham chiếu giao dịch từ cổng thanh toán
  @Prop({ type: String, maxlength: 100, unique: true, required: false })
  transactionRef: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
