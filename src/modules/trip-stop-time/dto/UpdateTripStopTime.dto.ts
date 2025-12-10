// src/trip-stop-time/dto/update-trip-stop-time.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateTripStopTimeDto } from 'src/modules/trip-stop-time/dto/CreateTripStopTime.dto';

export class UpdateTripStopTimeDto extends PartialType(CreateTripStopTimeDto) {}
