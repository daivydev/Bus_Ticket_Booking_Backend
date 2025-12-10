import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Booking } from '../booking/booking.schema'; // FK: Booking

export type TicketDocument = HydratedDocument<Ticket>;

export enum TicketStatus {
  Valid = 'Valid', // Vé còn hiệu lực
  Used = 'Used', // Đã check-in/Sử dụng
  Cancelled = 'Cancelled', // Đã hủy
}

export enum DeckType {
  Upper = 'Upper',
  Lower = 'Lower',
  Single = 'Single',
}

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Ticket {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Booking.name,
    required: true,
  })
  bookingId: MongooseSchema.Types.ObjectId;

  // Số ghế
  @Prop({ required: true, type: String })
  seatNumber: string;

  // Tầng (Áp dụng cho xe 2 tầng)
  @Prop({
    type: String,
    enum: Object.values(DeckType),
    required: true,
  })
  deck: DeckType;

  @Prop({ required: true, type: String, maxlength: 100 })
  passengerName: string;

  @Prop({
    type: String,
    enum: Object.values(Gender),
    required: true,
  })
  passengerGender: Gender;

  @Prop({ type: Number, min: 0, required: true })
  passengerAge: number;

  // Trạng thái vé (Thêm để quản lý check-in)
  @Prop({
    type: String,
    enum: Object.values(TicketStatus),
    default: TicketStatus.Valid,
    required: true,
  })
  status: TicketStatus;

  // Mã code/QR code (Duy nhất cho mục đích check-in)
  @Prop({ type: String, unique: true, required: true })
  ticketCode: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// Index để đảm bảo 1 ghế (seatNumber + deck) chỉ được đặt 1 lần TRONG CÙNG MỘT CHUYẾN ĐI.
// Để làm được điều này, cần truy cập TripId thông qua Booking.
// Việc kiểm tra này phức tạp hơn và nên được thực hiện trong Service.
