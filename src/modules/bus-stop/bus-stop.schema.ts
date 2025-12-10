import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { City } from 'src/modules/city/city.schema';

export type BusStopDocument = HydratedDocument<BusStop>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class BusStop {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: City.name,
    required: true,
  })
  cityId: MongooseSchema.Types.ObjectId;
  @Prop({ unique: true, required: true, type: String, maxLength: 50 })
  stopName: string;
}

export const BusStopSchema = SchemaFactory.createForClass(BusStop);
