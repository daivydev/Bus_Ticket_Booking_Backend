import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly fullname: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber('VN')
  readonly phoneNumber?: string;

  @IsOptional()
  @IsString()
  readonly preferLanguage?: string;
}
