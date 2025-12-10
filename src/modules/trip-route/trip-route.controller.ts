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
  Patch,
  UseGuards,
} from '@nestjs/common';
import { TripRouteService } from './trip-route.service';
import { CreateRouteDto } from './dto/CreateRouteDto.dto';
import { UpdateRouteDto } from './dto/UpdateRouteDto.dto';
import { Route } from './trip-route.schema';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('routes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripRouteController {
  constructor(private readonly tripRouteService: TripRouteService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllRoutes(): Promise<Route[]> {
    return this.tripRouteService.getAll();
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getRouteById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Route> {
    return this.tripRouteService.getById(id);
  }
  @Post()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async createRoute(@Body() createRouteDto: CreateRouteDto): Promise<Route> {
    return this.tripRouteService.create(createRouteDto);
  }
  @Patch(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async updateRoute(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ): Promise<Route> {
    return this.tripRouteService.update(id, updateRouteDto);
  }
  @Delete(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async deleteRoute(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<{ message: string }> {
    await this.tripRouteService.delete(id);
    return { message: 'Route has been deleted.' };
  }
}
