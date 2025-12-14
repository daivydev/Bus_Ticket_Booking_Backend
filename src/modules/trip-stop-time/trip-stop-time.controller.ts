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
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { CreateTripStopTimeDto } from 'src/modules/trip-stop-time/dto/CreateTripStopTime.dto';
import { UpdateTripStopTimeDto } from 'src/modules/trip-stop-time/dto/UpdateTripStopTime.dto';
import { TripStopTimeDocument } from 'src/modules/trip-stop-time/trip-stop-time.schema';
import { TripStopTimeService } from 'src/modules/trip-stop-time/trip-stop-time.service';

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
