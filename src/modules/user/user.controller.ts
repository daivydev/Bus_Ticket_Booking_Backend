import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CreateUserDto } from 'src/modules/user/dto/CreateUser.dto';
import { UpdateUserDto } from 'src/modules/user/dto/UpdateUser.dto';
import { User } from 'src/modules/user/user.schema';
import { UserService } from 'src/modules/user/user.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  // lấy danh sách user
  @Get()
  getAllUser(): Promise<User[]> {
    return this.userService.getAll();
  }

  // /users/id lấy user theo id
  @Get('/:id')
  async getUserById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.userService.getById(id);
  }

  // tạo mới user
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // cập nhật user
  @Patch('/:id')
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // /users/id xóa user
  @Delete('/:id')
  @Roles(Role.Admin)
  async deleteUser(@Param('id', ParseObjectIdPipe) id: string) {
    await this.userService.delete(id);
    return;
  }
}
