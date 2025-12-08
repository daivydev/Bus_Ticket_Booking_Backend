import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/modules/user/dto/CreateUser.dto';
import { UpdateUserDto } from 'src/modules/user/dto/UpdateUser.dto';
import { User } from 'src/modules/user/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}
  // findAll
  getAll(): Promise<User[]> {
    return this.userModel.find();
  }
  // getById
  async getById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  // create
  async create(userData: CreateUserDto) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(
        userData.password as string,
        salt,
      );
      const createdUser = new this.userModel({
        ...userData,
        password: hashedPassword,
      });
      const user = await createdUser.save();
      let userObject: any = user.toObject();
      delete userObject.password;
      return userObject;
    } catch (error) {
      // Mã lỗi 11000 là lỗi MongoDB cho Duplicated Key
      if (error.code === 11000) {
        // Ném ConflictException ngay tại Service
        throw new ConflictException(
          'User with this email/username already exists.',
        );
      }
      // Ném lại các lỗi khác để NestJS xử lý (có thể là 500)
      throw error;
    }
  }
  // updateById
  async update(id: string, userData: Partial<UpdateUserDto>) {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, userData, {
      new: true,
    });
    if (!updatedUser) {
      throw new NotFoundException('User Not Found');
    }
    return updatedUser;
  }

  // deleteById
  async delete(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
