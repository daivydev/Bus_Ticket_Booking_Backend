import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng.',
    },
  )
  @IsNotEmpty({
    message: 'Email không được để trống.',
  })
  readonly email: string;

  // Trường mật khẩu
  @IsString({
    message: 'Mật khẩu phải là chuỗi ký tự.',
  })
  @IsNotEmpty({
    message: 'Mật khẩu không được để trống.',
  })
  @MinLength(8, {
    message: 'Mật khẩu phải có ít nhất 8 ký tự.',
  })
  readonly password: string;
}
