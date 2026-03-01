import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusStop, BusStopDocument } from '../bus-stop/bus-stop.schema';
import { City, CityDocument } from '../city/city.schema';
import { CreateCityDto } from '../city/dto/CreateCity.dto';
import { UpdateCityDto } from '../city/dto/UpdateCity.dto';
import { Route, RouteDocument } from '../trip-route/trip-route.schema';

@Injectable()
export class CityService {
  constructor(
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    @InjectModel(BusStop.name) private busStopModel: Model<BusStopDocument>,
    @InjectModel(Route.name) private routeModel: Model<RouteDocument>,
  ) {}

  getAll(): Promise<CityDocument[]> {
    return this.cityModel.find();
  }

  async getById(id: string) {
    const city = await this.cityModel.findById(id);
    if (!city) {
      throw new NotFoundException('City not found');
    }
    return city;
  }

  async create(cityData: CreateCityDto) {
    try {
      const newCity = new this.cityModel(cityData);
      return await newCity.save();
    } catch (error) {
      if (error.code === 11000)
        throw new ConflictException('City already exists.');
      throw error;
    }
  }

  async update(id: string, cityData: UpdateCityDto) {
    try {
      const updatedCity = await this.cityModel.findByIdAndUpdate(id, cityData, {
        new: true,
      });
      if (!updatedCity) {
        throw new NotFoundException('City Not Found');
      }
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('City already exists.');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    const stopsCount = await this.busStopModel
      .countDocuments({ city_id: id })
      .exec();
    if (stopsCount > 0) {
      throw new ConflictException(
        `Cannot delete this city. There are still ${stopsCount} bus stop using this city.`,
      );
    }

    const routesCount = await this.routeModel
      .countDocuments({
        $or: [{ departureCityId: id }, { destinationCityId: id }],
      })
      .exec();
    if (routesCount > 0) {
      throw new ConflictException(
        `Cannot delete this city. There are still ${routesCount} routes using this city.`,
      );
    }

    const result = await this.cityModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('City not found');
    }
    return { message: 'City has been deleted.' };
  }

  async exists(id: string): Promise<boolean> {
    return (await this.cityModel.exists({ _id: id })) !== null;
  }
}
