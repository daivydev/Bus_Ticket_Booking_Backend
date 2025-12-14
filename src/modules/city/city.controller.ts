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
import { City } from 'src/modules/city/city.schema';
import { CityService } from 'src/modules/city/city.service';
import { CreateCityDto } from 'src/modules/city/dto/CreateCity.dto';
import { UpdateCityDto } from 'src/modules/city/dto/UpdateCity.dto';

@Controller('cities')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
export class CityController {
  constructor(private readonly cityService: CityService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllCity(): Promise<City[]> {
    return this.cityService.getAll();
  }
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getCityById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.cityService.getById(id);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.Admin)
  async createCity(@Body() createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto);
  }
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async updateCity(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.cityService.update(id, updateCityDto);
  }
  @Delete('/:id')
  @Roles(Role.Admin)
  @HttpCode(204)
  async deleteCity(@Param('id', ParseObjectIdPipe) id: string) {
    await this.cityService.delete(id);
  }
}
