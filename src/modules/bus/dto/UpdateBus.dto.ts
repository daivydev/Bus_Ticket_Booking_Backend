import { IsString, MaxLength, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateBusDto {
  @IsString()
  @MaxLength(15)
  licensePlate?: string;

  @IsNumber()
  @Min(1)
  totalSeats?: number;

  @IsBoolean()
  isDoubleDecker?: boolean = false;
}
