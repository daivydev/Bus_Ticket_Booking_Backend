import {
  IsString,
  MaxLength,
  IsMongoId,
  NotEquals,
  IsNotEmpty,
} from 'class-validator';

export class CreateRouteDto {
  @IsNotEmpty()
  @IsMongoId()
  @NotEquals((dto: CreateRouteDto) => dto.destinationCityId, {
    message: 'Điểm đi và điểm đến không được trùng nhau.',
  })
  departureCityId: string;

  @IsNotEmpty()
  @IsMongoId()
  destinationCityId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  operatorName: string;
}
