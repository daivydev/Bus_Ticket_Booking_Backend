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
import { Bus } from '../bus/bus.chema';
import { BusService } from '../bus/bus.service';
import { CreateBusDto } from '../bus/dto/CreateBus.dto';
import { UpdateBusDto } from '../bus/dto/UpdateBus.dto';

@Controller('buses')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusController {
  constructor(private busService: BusService) {}
  @Get()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  getAllBus(): Promise<Bus[]> {
    return this.busService.getAll();
  }
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async getBusById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.busService.getById(id);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Admin)
  async createBus(@Body() createBusDto: CreateBusDto) {
    return this.busService.create(createBusDto);
  }
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async updateBus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBusDto: UpdateBusDto,
  ) {
    return this.busService.update(id, updateBusDto);
  }
  @Delete('/:id')
  @Roles(Role.Admin)
  @HttpCode(204)
  async deleteBus(@Param('id', ParseObjectIdPipe) id: string) {
    await this.busService.delete(id);
  }
}
