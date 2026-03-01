import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTripStopTimeDto } from './dto/CreateTripStopTime.dto';
import { UpdateTripStopTimeDto } from './dto/UpdateTripStopTime.dto';
import { TripStopTimeDocument } from './trip-stop-time.schema';
import { TripStopTimeService } from './trip-stop-time.service';

@Controller('trip-stop-times')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class TripStopTimeController {
  constructor(private readonly tripStopTimeService: TripStopTimeService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTripStopTimes() {
    return this.tripStopTimeService.getAll();
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTripStopTimeById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.tripStopTimeService.getById(id);
  }
  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async createTripStopTime(@Body() createDto: CreateTripStopTimeDto) {
    return this.tripStopTimeService.create(createDto);
  }
  @Patch(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async updateTripStopTime(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateDto: UpdateTripStopTimeDto,
  ) {
    return this.tripStopTimeService.update(id, updateDto);
  }
  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTripStopTime(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.tripStopTimeService.delete(id);
  }
}
