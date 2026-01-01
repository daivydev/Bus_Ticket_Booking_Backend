import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { DeckType, Gender, TicketStatus } from '../ticket.schema';

export class CreateTicketDto {
  @IsOptional()
  @IsMongoId()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  seatNumber: string;

  @IsEnum(DeckType)
  @IsNotEmpty()
  deck: DeckType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  passengerName: string;

  @IsEnum(Gender)
  @IsOptional()
  passengerGender?: Gender;

  @IsInt()
  @Min(0)
  @IsOptional()
  passengerAge?: number;

  @IsString()
  @IsNotEmpty()
  ticketCode: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
