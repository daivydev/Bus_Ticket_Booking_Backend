import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { Role } from 'src/common/enums/roles.enum';
import { IsMatching } from 'src/util/validator/match.validator';

export class CreateUserDto {
  // Họ và tên (Bắt buộc)
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự' })
  fullname: string;

  // Role (Bắt buộc)
  @IsNotEmpty({ message: 'Role không được để trống' })
  @IsEnum(Role, {
    message: `Role phải là một trong các giá trị hợp lệ: ${Object.values(
      Role,
    ).join(', ')}`,
  })
  role: Role;

  // Email (Bắt buộc, Phải là định dạng Email hợp lệ)
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  // Mật khẩu (Bắt buộc, Độ dài tối thiểu)
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  // Mật khẩu xác nhận (Bắt buộc, Độ dài tối thiểu)
  @IsNotEmpty({ message: 'Mật khẩu xác nhận không được để trống' })
  @IsMatching('password', {
    message: 'Mật khẩu xác nhận không khớp với Mật khẩu đã nhập',
  })
  confirmPassword: string;

  // Số điện thoại (Không bắt buộc)
  // Có thể thêm @IsPhoneNumber() nếu bạn muốn kiểm tra định dạng
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại không đúng định dạng Việt Nam',
  })
  phoneNumber?: string;

  // Ngôn ngữ ưu tiên (Không bắt buộc, có thể dùng @IsEnum nếu có định nghĩa Enum)
  @IsOptional()
  @IsString({ message: 'Ngôn ngữ ưu tiên phải là chuỗi ký tự' })
  preferLanguage?: string;
}
