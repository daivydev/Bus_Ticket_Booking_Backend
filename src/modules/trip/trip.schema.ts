import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Bus } from 'src/modules/bus/bus.chema';
import { Route } from 'src/modules/trip-route/trip-route.schema';

export type TripDocument = HydratedDocument<Trip>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Trip {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Route.name,
    required: true,
  })
  routeId: MongooseSchema.Types.ObjectId;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Bus.name,
    required: true,
  })
  busId: MongooseSchema.Types.ObjectId | Bus;
  @Prop({ required: true, type: Date })
  departureTime: Date;
  @Prop({ required: true, type: Date })
  estimatedArrivalTime: Date;
  @Prop({ required: true, type: Number, min: 0 })
  basePrice: number;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
