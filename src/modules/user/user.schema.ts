import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({ required: true, maxlength: 100 })
  fullname: string;

  @Prop({ required: true, maxlength: 10 })
  role: string;

  @Prop({ unique: true, required: true, index: true, lowercase: true })
  email: string;

  @Prop({ required: true, minlength: 8, select: false })
  password: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  // Ngôn ngữ: Không bắt buộc, có thể có giá trị mặc định
  @Prop({ default: 'vi' })
  preferLanguage: string;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Tùy chọn: Thêm Pre-Save Hook để Hash Mật khẩu
// UserSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });
