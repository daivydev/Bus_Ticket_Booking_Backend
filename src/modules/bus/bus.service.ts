import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bus, BusDocument } from 'src/modules/bus/bus.chema';
import { CreateBusDto } from 'src/modules/bus/dto/CreateBus.dto';
import { UpdateBusDto } from 'src/modules/bus/dto/UpdateBus.dto';
import { Trip, TripDocument } from 'src/modules/trip/trip.schema';

@Injectable()
export class BusService {
  constructor(
    @InjectModel(Bus.name) private busModel: Model<BusDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
  ) {}
  getAll(): Promise<Bus[]> {
    return this.busModel.find();
  }
  async getById(id: string) {
    const bus = await this.busModel.findById(id);
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }
    return bus;
  }

  async create(busData: CreateBusDto) {
    try {
      const newbus = new this.busModel(busData);
      return await newbus.save();
    } catch (error) {
      if (error.code === 11000)
        throw new ConflictException('Bus already exists.');
      throw error;
    }
  }

  async update(id: string, busData: UpdateBusDto) {
    const updatedbus = await this.busModel.findByIdAndUpdate(id, busData, {
      new: true,
    });
    if (!updatedbus) {
      throw new NotFoundException('Bus Not Found');
    }
    return updatedbus;
  }

  async delete(id: string): Promise<{ message: string }> {
    const tripsCount = await this.tripModel
      .countDocuments({ bus_id: id })
      .exec();
    if (tripsCount > 0) {
      throw new ConflictException(
        `This bus cannot be deleted. There are still ${tripsCount} trips (Trips) scheduled to use this bus.`,
      );
    }

    const result = await this.busModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Bus not found');
    }
    return { message: 'Bus has been deleted.' };
  }

  async exists(id: string): Promise<boolean> {
    return (await this.busModel.exists({ _id: id })) !== null;
  }
}
