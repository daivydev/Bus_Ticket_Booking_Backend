import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from '../booking/booking.schema';
import { BusStop, BusStopDocument } from '../bus-stop/bus-stop.schema';
import { CreateBusStopDto } from '../bus-stop/dto/CreateBusStop.dto';
import { UpdateBusStopDto } from '../bus-stop/dto/UpdateBusStop.dto';
import { CityService } from '../city/city.service';
import {
  TripStopTime,
  TripStopTimeDocument,
} from '../trip-stop-time/trip-stop-time.schema';

@Injectable()
export class BusStopService {
  constructor(
    @InjectModel(BusStop.name) private busStopModel: Model<BusStopDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(TripStopTime.name)
    private tripStopTimeModel: Model<TripStopTimeDocument>,
    private cityService: CityService,
  ) {}
  getAll(): Promise<BusStop[]> {
    return this.busStopModel.find().populate('cityId');
  }

  async getById(id: string) {
    const busStop = await this.busStopModel.findById(id).populate('cityId');
    if (!busStop) {
      throw new NotFoundException('Bus Stop Not Found');
    }
    return busStop;
  }

  async create(busStopData: CreateBusStopDto) {
    try {
      const newBusStop = new this.busStopModel(busStopData);
      return await newBusStop.save();
    } catch (error) {
      if (error.code === 11000)
        throw new ConflictException('Bus Stop already exists.');
      throw error;
    }
  }

  async update(id: string, busStopData: UpdateBusStopDto) {
    try {
      const updatedBusStop = await this.busStopModel.findByIdAndUpdate(
        id,
        busStopData,
        {
          new: true,
        },
      );
      if (!updatedBusStop) {
        throw new NotFoundException('Bus Stop Not Found');
      }
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Bus Stop already exists.');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    const bookingCounts = await this.bookingModel
      .countDocuments({ cityId: id })
      .exec();
    if (bookingCounts > 0) {
      throw new ConflictException(
        `Cannot delete this bus stop. There are still ${bookingCounts} booking using this bus stop.`,
      );
    }

    const tripStopTimeCounts = await this.tripStopTimeModel
      .countDocuments({ stopId: id })
      .exec();
    if (tripStopTimeCounts > 0) {
      throw new ConflictException(
        `Cannot delete this bus stop. There are still ${tripStopTimeCounts} tripStopTime using this bus stop.`,
      );
    }

    const result = await this.busStopModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Bus Stop not found');
    }
    return { message: 'Bus Stop has been deleted.' };
  }

  async exists(id: string): Promise<boolean> {
    return (await this.busStopModel.exists({ _id: id })) !== null;
  }
}
