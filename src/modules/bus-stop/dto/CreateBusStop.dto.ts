import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBusStopDto {
  @IsNotEmpty()
  @IsMongoId()
  cityId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  stopName: string;
}
