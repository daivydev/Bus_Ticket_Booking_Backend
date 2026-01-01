import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';
import { Trip } from '../trip/trip.schema';
import { BusStop } from 'src/modules/bus-stop/bus-stop.schema';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Cancelled = 'Cancelled',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Booking {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Trip.name,
    required: true,
  })
  tripId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: Number, min: 0 })
  totalAmount: number;

  @Prop({
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.Pending,
    required: true,
  })
  status: BookingStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: BusStop.name,
    required: true,
  })
  pickupStopId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: BusStop.name,
    required: true,
  })
  dropoffStopId: MongooseSchema.Types.ObjectId;
  @Prop({ type: Date, default: null })
  expiresAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
