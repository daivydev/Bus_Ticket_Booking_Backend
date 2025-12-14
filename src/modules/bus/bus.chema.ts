import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BusDocument = HydratedDocument<Bus>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Bus {
  @Prop({ required: true, unique: true, maxlength: 15 })
  licensePlate: string;

  @Prop({ required: true, type: Number })
  totalSeats: number;

  @Prop({ default: false, type: Boolean })
  isDoubleDecker: boolean;
}

export const BusSchema = SchemaFactory.createForClass(Bus);
