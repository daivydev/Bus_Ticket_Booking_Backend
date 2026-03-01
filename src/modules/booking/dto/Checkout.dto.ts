import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateBookingDto } from '../../booking/dto/CreateBooking.dto';
import { CreateTicketDto } from '../../ticket/dto/CreateTicket.dto';
import { OmitType } from '@nestjs/mapped-types';

export class TicketCheckoutDto extends OmitType(CreateTicketDto, [
  'bookingId',
] as const) {}

export class CheckoutDto extends CreateBookingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketCheckoutDto)
  tickets: CreateTicketDto[];

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsEnum(['mobile', 'web'], { message: 'platform must be web or mobile' })
  @IsNotEmpty()
  platform: 'web' | 'mobile';
}
