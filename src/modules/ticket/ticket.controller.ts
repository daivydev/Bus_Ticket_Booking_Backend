import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/CreateTicket.dto';
import { UpdateTicketDto } from './dto/UpdateTicket.dto';
import { TicketDocument } from './ticket.schema';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';

@Controller('tickets')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async getAllTicket(): Promise<TicketDocument[]> {
    return this.ticketService.getAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getTicketById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<TicketDocument> {
    return this.ticketService.getById(id);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getTicketsByUserId(
    @Param('userId', ParseObjectIdPipe) userId: string,
  ): Promise<TicketDocument[]> {
    return this.ticketService.getTicketsByUser(userId);
  }

  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
  ): Promise<TicketDocument> {
    return this.ticketService.create(createTicketDto);
  }

  @Patch('/:id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async updateTicket(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<TicketDocument> {
    return this.ticketService.update(id, updateTicketDto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async deleteTicket(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<{ message: string }> {
    return this.ticketService.delete(id);
  }
}
