import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from 'src/modules/auth/dto/sign-up.dto';
import { User, UserDocument } from 'src/modules/user/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async findUserForAuth(email: string): Promise<UserDocument | null> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();
    return user;
  }

  // 1. Xác thực người dùng (Tìm user và so sánh mật khẩu)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findUserForAuth(email);
    if (!user) {
      return null;
    }
    // Kiểm tra tồn tại và so sánh mật khẩu (sử dụng bcrypt)
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  // 2. Tạo Token JWT (Nếu xác thực thành công)
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '60m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken });
    const {
      password,
      refreshToken: userRefreshToken,
      accessToken: userAccessToken,
      ...userInfo
    } = user;
    return { user: userInfo, accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    // 1. Giải mã và xác minh Refresh Token
    const payload = this.jwtService.verify(refreshToken);

    // 2. Tìm người dùng trong DB và kiểm tra Refresh Token có khớp không
    const user = await this.userModel.findById(payload.sub);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token is invalid or revoked.');
    }

    // 3. Tạo Access Token mới và Refresh Token mới
    return this.login(user);
  }

  async signUp(signupData: SignUpDto): Promise<Omit<User, 'password'>> {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(signupData.password, salt);
      const createdUser = new this.userModel({
        ...signupData,
        password: hashedPassword,
        role: 'user',
      });

      const user = await createdUser.save();
      const userObject: any = user.toObject();
      delete userObject.password;

      return userObject;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'User with this email/phone already exists.',
        );
      }
      throw error;
    }
  }
}
