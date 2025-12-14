import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/modules/user/dto/CreateUser.dto';
import { UpdateUserDto } from 'src/modules/user/dto/UpdateUser.dto';
import { User, UserDocument } from 'src/modules/user/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  private prepareUserResponse(user: UserDocument): Omit<User, 'password'> {
    const userObject: any = user.toObject();
    delete userObject.password;
    return userObject as Omit<User, 'password'>;
  }

  async getAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => this.prepareUserResponse(user));
  }

  async getById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prepareUserResponse(user);
  }

  async create(userData: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        userData.password as string,
        salt,
      );
      const createdUser = new this.userModel({
        ...userData,
        password: hashedPassword,
      });
      const user = await createdUser.save();
      return this.prepareUserResponse(user);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'User with this email/phone already exists.',
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    userData: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    let updateData = { ...userData };
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData = {
        ...updateData,
        password: await bcrypt.hash(userData.password, salt),
      };
      delete updateData.password;
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('User Not Found');
    }
    return this.prepareUserResponse(updatedUser);
  }

  async delete(id: string): Promise<{ message: string }> {
    // const bookingsCount = await this.bookingModel.countDocuments({ user_id: id }).exec();
    // if (bookingsCount > 0) {
    //     throw new ConflictException(`Không thể xóa người dùng. Vẫn còn ${bookingsCount} đơn đặt vé đang liên kết.`);
    // }
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Account has been deleted.' };
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async exists(id: string): Promise<boolean> {
    return (await this.userModel.exists({ _id: id })) !== null;
  }
}
