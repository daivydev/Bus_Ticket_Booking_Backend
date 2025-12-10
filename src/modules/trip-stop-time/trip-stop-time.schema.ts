import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Trip } from '../trip/trip.schema';
import { BusStop } from 'src/modules/bus-stop/bus-stop.schema';

export type TripStopTimeDocument = HydratedDocument<TripStopTime>;

enum StopType {
  Pickup = 'Pickup',
  Dropoff = 'Dropoff',
  Both = 'Both',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class TripStopTime {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Trip.name,
    required: true,
  })
  tripId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: BusStop.name,
    required: true,
  })
  stopId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(StopType),
    required: true,
  })
  stopType: StopType;

  @Prop({ required: true, type: Date })
  scheduledTime: Date;
}

export const TripStopTimeSchema = SchemaFactory.createForClass(TripStopTime);

TripStopTimeSchema.index({ tripId: 1, stopId: 1 }, { unique: true });
