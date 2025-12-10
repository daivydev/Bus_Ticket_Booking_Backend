import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CityDocument = HydratedDocument<City>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class City {
  @Prop({ required: true, maxlength: 100, unique: true })
  cityName: string;
}

export const CitySchema = SchemaFactory.createForClass(City);
