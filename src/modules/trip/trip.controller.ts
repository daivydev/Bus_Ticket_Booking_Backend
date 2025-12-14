import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { TripService } from './trip.service';
import { TripDocument } from './trip.schema';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { CreateTripDto } from 'src/modules/trip/dto/CreateTrip.dto';
import { UpdateTripDto } from 'src/modules/trip/dto/UpdateTrip.dto';

@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class TripController {
  constructor(private readonly tripService: TripService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTrips() {
    return this.tripService.getAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTripById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.tripService.getById(id);
  }

  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async createTrip(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async updateTrip(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripService.update(id, updateTripDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(204)
  async deleteTrip(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.tripService.delete(id);
  }
}
