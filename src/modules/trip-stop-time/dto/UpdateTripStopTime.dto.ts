import { PartialType } from '@nestjs/mapped-types';
import { CreateTripStopTimeDto } from '../../trip-stop-time/dto/CreateTripStopTime.dto';

export class UpdateTripStopTimeDto extends PartialType(CreateTripStopTimeDto) {}
