import {
  IsString,
  MaxLength,
  IsNumber,
  IsBoolean,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateBusDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  licensePlate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  totalSeats: number;

  @IsBoolean()
  isDoubleDecker: boolean = false;
}
