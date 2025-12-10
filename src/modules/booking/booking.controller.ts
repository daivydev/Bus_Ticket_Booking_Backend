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
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/CreateBooking.dto';
import { UpdateBookingDto } from './dto/UpdateBooking.dto';
import { BookingDocument } from './booking.schema';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';

@Controller('bookings')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async getAllBooking(): Promise<BookingDocument[]> {
    return this.bookingService.getAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getBookingById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<BookingDocument> {
    return this.bookingService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingDocument> {
    return this.bookingService.create(createBookingDto);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateBooking(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<BookingDocument> {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.FORBIDDEN)
  async deleteBooking(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    return this.bookingService.delete(id);
  }
}
