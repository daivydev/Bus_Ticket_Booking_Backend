import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Không bỏ qua thời gian hết hạn của token
      secretOrKey: process.env.SECRET_KEY as string, // Thay thế bằng khóa bí mật của bạn
    });
  }

  // Hàm validate được gọi sau khi token được giải mã thành công
  async validate(payload: any) {
    // 1. Tìm người dùng dựa trên ID hoặc thông tin trong payload
    const user = await this.userService.getById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }

    // 2. Trả về đối tượng user, nó sẽ được gắn vào request.user
    return user;
  }
}
