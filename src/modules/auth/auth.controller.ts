// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { LoginDto } from 'src/modules/auth/dto/sign-in.dto';
import { CreateUserDto } from 'src/modules/user/dto/CreateUser.dto';
import { UserService } from 'src/modules/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new BadRequestException('Email hoặc mật khẩu không đúng.');
    }
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    return {
      statusCode: 200,
      message: 'Logout successful. Please remove token from client storage.',
    };
  }

  @Post('refresh-token')
  async refreshTokens(@Body('refresh_token') refreshToken: string) {
    // Gọi hàm mới trong AuthService
    return this.authService.refreshTokens(refreshToken);
  }
}
