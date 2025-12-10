import { IsString, MaxLength } from 'class-validator';

export class UpdateCityDto {
  @IsString()
  @MaxLength(100)
  cityName?: string;
}
