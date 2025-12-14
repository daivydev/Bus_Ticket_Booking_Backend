import { PartialType } from '@nestjs/mapped-types';

import {
  IsDateString,
  IsMongoId,
  IsNumber,
  Min,
  Validate,
} from 'class-validator';
import {
  CreateTripDto,
  IsArrivalAfterDepartureConstraint,
} from 'src/modules/trip/dto/CreateTrip.dto';

export class UpdateTripDto extends PartialType(CreateTripDto) {
  @IsDateString()
  @Validate(IsArrivalAfterDepartureConstraint, ['departureTime'], {
    message: 'Estimated arrival time must be later than departure time.',
  })
  estimatedArrivalTime?: string;

  @IsMongoId()
  routeId?: string;

  @IsMongoId()
  busId?: string;

  @IsNumber()
  @Min(0)
  basePrice?: number;
}
