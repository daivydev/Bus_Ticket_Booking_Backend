import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../ticket.schema';
import { CreateTicketDto } from 'src/modules/ticket/dto/CreateTicket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
