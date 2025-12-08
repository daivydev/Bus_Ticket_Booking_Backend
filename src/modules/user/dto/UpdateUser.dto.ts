import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums/roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự' })
  fullname?: string;

  @IsEnum(Role, {
    message: `Role phải là một trong các giá trị hợp lệ: ${Object.values(
      Role,
    ).join(', ')}`,
  })
  role: Role;

  @IsOptional()
  @IsString()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại không đúng định dạng Việt Nam',
  })
  phoneNumber?: string;

  @IsOptional()
  preferLanguage?: string;
}
