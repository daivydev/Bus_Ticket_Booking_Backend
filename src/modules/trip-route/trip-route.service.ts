import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CityService } from 'src/modules/city/city.service';
import { CreateRouteDto } from 'src/modules/trip-route/dto/CreateRouteDto.dto';
import { UpdateRouteDto } from 'src/modules/trip-route/dto/UpdateRouteDto.dto';
import { Route, RouteDocument } from 'src/modules/trip-route/trip-route.schema';
import { Trip, TripDocument } from 'src/modules/trip/trip.schema';

@Injectable()
export class TripRouteService {
  constructor(
    @InjectModel(Route.name) private routeModel: Model<RouteDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    private cityService: CityService,
  ) {}

  getAll(): Promise<Route[]> {
    return this.routeModel.find();
  }

  async getById(id: string) {
    const route = await this.routeModel.findById(id);
    if (!route) {
      throw new NotFoundException('Route Not Found');
    }
    return route;
  }

  async create(routeData: CreateRouteDto) {
    if (routeData.departureCityId === routeData.destinationCityId) {
      throw new BadRequestException(
        'Departure and destination cities cannot be the same.',
      );
    }
    const [depCityExists, destCityExists] = await Promise.all([
      this.cityService.exists(routeData.departureCityId),
      this.cityService.exists(routeData.destinationCityId),
    ]);

    if (!depCityExists) {
      throw new NotFoundException(
        `Departure City (ID: ${routeData.departureCityId}) Not Found.`,
      );
    }

    if (!destCityExists) {
      throw new NotFoundException(
        `Destination City (ID: ${routeData.destinationCityId}) Not Found.`,
      );
    }

    try {
      const newroute = new this.routeModel(routeData);
      return await newroute.save();
    } catch (error) {
      if (error.code === 11000)
        throw new ConflictException('Route already exists.');
      throw error;
    }
  }

  async update(id: string, routeData: UpdateRouteDto) {
    const updatedroute = await this.routeModel.findByIdAndUpdate(
      id,
      routeData,
      {
        new: true,
      },
    );
    if (!updatedroute) {
      throw new NotFoundException('Route Not Found');
    }
    return updatedroute;
  }

  async delete(id: string): Promise<{ message: string }> {
    const tripsCount = await this.tripModel
      .countDocuments({ route_id: id })
      .exec();
    if (tripsCount > 0) {
      throw new ConflictException(
        `This route cannot be deleted. There are still ${tripsCount} trips scheduled using it.`,
      );
    }
    const result = await this.routeModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Route not found');
    }
    return { message: 'Route has been deleted.' };
  }

  async exists(id: string): Promise<boolean> {
    return (await this.routeModel.exists({ _id: id })) !== null;
  }
}
