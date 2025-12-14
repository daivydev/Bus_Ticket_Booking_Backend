import { IsMongoId, IsString, MaxLength } from 'class-validator';

export class UpdateBusStopDto {
  @IsMongoId()
  cityId?: string;

  @IsString()
  @MaxLength(50)
  stopName?: string;
}
