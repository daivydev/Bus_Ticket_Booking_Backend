import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './trip.schema';
import { BusService } from '../bus/bus.service';
import { TripRouteService } from 'src/modules/trip-route/trip-route.service';
import { UpdateTripDto } from 'src/modules/trip/dto/UpdateTrip.dto';
import { CreateTripDto } from 'src/modules/trip/dto/CreateTrip.dto';
import {
  TripStopTime,
  TripStopTimeDocument,
} from 'src/modules/trip-stop-time/trip-stop-time.schema';
import { Booking, BookingDocument } from 'src/modules/booking/booking.schema';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    private routeService: TripRouteService,
    private busService: BusService,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(TripStopTime.name)
    private tripStopTimeModel: Model<TripStopTimeDocument>,
  ) {}

  async exists(id: string): Promise<boolean> {
    return (await this.tripModel.exists({ _id: id })) !== null;
  }

  async getAll() {
    return this.tripModel
      .find()
      .populate({
        path: 'routeId',
        populate: [{ path: 'departureCityId' }, { path: 'destinationCityId' }],
      })
      .populate('busId')
      .exec();
  }

  async getById(id: string) {
    const trip = await this.tripModel
      .findById(id)
      .populate('busId')
      .populate({
        path: 'routeId',
        populate: [{ path: 'departureCityId' }, { path: 'destinationCityId' }],
      })
      .exec();
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found.`);
    }
    return trip;
  }

  private async checkTripConflict(
    busId: string,
    newDepartureTime: Date,
    newEstimatedArrivalTime: Date,
    currentTripId?: string,
  ): Promise<void> {
    const conflictQuery: any = {
      busId: busId,
      // Xung đột xảy ra khi: (Bắt đầu chuyến đang xét < Kết thúc chuyến mới) VÀ (Kết thúc chuyến đang xét > Bắt đầu chuyến mới)
      $and: [
        { departureTime: { $lt: newEstimatedArrivalTime } },
        { estimatedArrivalTime: { $gt: newDepartureTime } },
      ],
    };

    if (currentTripId) {
      // Loại trừ chuyến đi hiện tại khi đang cập nhật
      conflictQuery._id = { $ne: currentTripId };
    }

    const conflictingTripCount = await this.tripModel
      .countDocuments(conflictQuery)
      .exec();

    if (conflictingTripCount > 0) {
      throw new ConflictException(
        'This bus already has another trip scheduled during this time period.',
      );
    }
  }

  async create(tripData: CreateTripDto) {
    const [routeExists, busExists] = await Promise.all([
      this.routeService.exists(tripData.routeId),
      this.busService.exists(tripData.busId),
    ]);
    if (!routeExists) {
      throw new NotFoundException(`Route ID (${tripData.routeId}) Not Found.`);
    }
    if (!busExists) {
      throw new NotFoundException(`Bus ID (${tripData.busId}) Not Found.`);
    }

    // Kiểm tra xung đột thời gian
    await this.checkTripConflict(
      tripData.busId,
      new Date(tripData.departureTime),
      new Date(tripData.estimatedArrivalTime),
    );

    // Tạo Trip
    const newTrip = new this.tripModel(tripData);
    return await newTrip.save();
  }

  async update(id: string, tripData: UpdateTripDto) {
    // Lấy chuyến đi hiện tại để kiểm tra xung đột nếu các trường không được cung cấp
    const existingTrip = await this.tripModel.findById(id).exec();
    if (!existingTrip) {
      throw new NotFoundException('Trip Not Found');
    }

    // Kiểm tra Khóa ngoại nếu chúng được cập nhật
    if (tripData.routeId) {
      const routeExists = await this.routeService.exists(tripData.routeId);
      if (!routeExists) {
        throw new NotFoundException(
          `Route ID (${tripData.routeId}) không tồn tại.`,
        );
      }
    }
    if (tripData.busId) {
      const busExists = await this.busService.exists(tripData.busId);
      if (!busExists) {
        throw new NotFoundException(
          `Bus ID (${tripData.busId}) không tồn tại.`,
        );
      }
    }

    // Kiểm tra xung đột thời gian (áp dụng cho busId, departureTime, estimatedArrivalTime)
    const newBusId = tripData.busId || existingTrip.busId.toString();
    const newDepartureTime = new Date(
      tripData.departureTime || existingTrip.departureTime,
    );
    const newEstimatedArrivalTime = new Date(
      tripData.estimatedArrivalTime || existingTrip.estimatedArrivalTime,
    );

    await this.checkTripConflict(
      newBusId,
      newDepartureTime,
      newEstimatedArrivalTime,
      id,
    );

    // Thực hiện Update
    const updatedTrip = await this.tripModel
      .findByIdAndUpdate(id, tripData, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedTrip) {
      throw new NotFoundException('Trip Not Found');
    }
    return updatedTrip;
  }

  async delete(id: string): Promise<{ message: string }> {
    // Kiểm tra Booking (Nếu có Booking liên quan, không cho xóa)
    const bookingsCount = await this.bookingModel
      .countDocuments({ tripId: id })
      .exec();
    if (bookingsCount > 0) {
      throw new ConflictException(
        `This trip cannot be deleted. There are still linked bookings with the ${bookingsCount} option.`,
      );
    }

    // Kiểm tra TripStopTime (Nếu có điểm dừng liên quan, không cho xóa)
    const tripStopsCount = await this.tripStopTimeModel
      .countDocuments({ tripId: id }) // Sử dụng tripId, không phải trip_id
      .exec();
    if (tripStopsCount > 0) {
      throw new ConflictException(
        `This trip cannot be deleted. There are still linked ${tripStopsCount} stops.`,
      );
    }

    // Thực hiện xóa
    const result: any = await this.tripModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Trip not found');
    }
    return { message: 'Trip has been deleted.' };
  }
}
