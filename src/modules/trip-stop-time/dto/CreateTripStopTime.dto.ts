import { IsMongoId, IsNotEmpty, IsDateString, IsIn } from 'class-validator';

export enum StopTypeDto {
  Pickup = 'Pickup',
  Dropoff = 'Dropoff',
  Both = 'Both',
}

export class CreateTripStopTimeDto {
  @IsMongoId()
  @IsNotEmpty()
  tripId: string;

  @IsMongoId()
  @IsNotEmpty()
  stopId: string;

  @IsIn(Object.values(StopTypeDto))
  @IsNotEmpty()
  stopType: StopTypeDto;

  @IsDateString()
  @IsNotEmpty()
  scheduledTime: string;
}
