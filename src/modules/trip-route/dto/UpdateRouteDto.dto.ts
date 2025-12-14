import { IsString, MaxLength, IsMongoId, NotEquals } from 'class-validator';

export class UpdateRouteDto {
  @IsMongoId()
  @NotEquals((dto: UpdateRouteDto) => dto.destinationCityId, {
    message: 'Điểm đi và điểm đến không được trùng nhau.',
  })
  departureCityId?: string;

  @IsMongoId()
  destinationCityId?: string;

  @IsString()
  @MaxLength(100)
  operatorName?: string;
}
