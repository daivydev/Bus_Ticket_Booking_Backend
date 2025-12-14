import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { City } from '../city/city.schema';
export type RouteDocument = HydratedDocument<Route>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Route {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: City.name,
    required: true,
  })
  // 693d59dc167986db78212b38 693d59fb167986db78212b39 693d5a24167986db78212b3b 693d5a34167986db78212b3c 693d5a3d167986db78212b3d
  departureCityId: MongooseSchema.Types.ObjectId;
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: City.name,
    required: true,
  })
  destinationCityId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, maxlength: 100, trim: true })
  operatorName: string;
}

export const RouteSchema = SchemaFactory.createForClass(Route);
