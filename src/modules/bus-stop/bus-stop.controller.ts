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
import { BusStop } from 'src/modules/bus-stop/bus-stop.schema';
import { BusStopService } from 'src/modules/bus-stop/bus-stop.service';
import { CreateBusStopDto } from 'src/modules/bus-stop/dto/CreateBusStop.dto';
import { UpdateBusStopDto } from 'src/modules/bus-stop/dto/UpdateBusStop.dto';

@Controller('bus-stops')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusStopController {
  constructor(private readonly busStopSerVice: BusStopService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllBusStop(): Promise<BusStop[]> {
    return this.busStopSerVice.getAll();
  }
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getBusStopById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.busStopSerVice.getById(id);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Admin)
  async createBusStop(@Body() createBusStopDto: CreateBusStopDto) {
    return this.busStopSerVice.create(createBusStopDto);
  }
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async updateBusStop(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBusStopDto: UpdateBusStopDto,
  ) {
    return this.busStopSerVice.update(id, updateBusStopDto);
  }
  @Delete('/:id')
  @Roles(Role.Admin)
  @HttpCode(204)
  async deleteCity(@Param('id', ParseObjectIdPipe) id: string) {
    await this.busStopSerVice.delete(id);
  }
}
