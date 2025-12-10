import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusStopService } from 'src/modules/bus-stop/bus-stop.service';
import { CreateTripStopTimeDto } from 'src/modules/trip-stop-time/dto/CreateTripStopTime.dto';
import { UpdateTripStopTimeDto } from 'src/modules/trip-stop-time/dto/UpdateTripStopTime.dto';
import {
  TripStopTime,
  TripStopTimeDocument,
} from 'src/modules/trip-stop-time/trip-stop-time.schema';
import { TripDocument } from 'src/modules/trip/trip.schema';
import { TripService } from 'src/modules/trip/trip.service';

@Injectable()
export class TripStopTimeService {
  constructor(
    @InjectModel(TripStopTime.name)
    private tripStopTimeModel: Model<TripStopTimeDocument>,
    private tripService: TripService,
    private busStopService: BusStopService,
  ) {}
  async getAll(): Promise<TripStopTimeDocument[]> {
    return this.tripStopTimeModel
      .find()
      .populate('tripId')
      .populate('stopId')
      .exec();
  }

  async getById(id: string): Promise<TripStopTimeDocument> {
    const tripStopTime = await this.tripStopTimeModel
      .findById(id)
      .populate('tripId')
      .populate('stopId')
      .exec();
    if (!tripStopTime) {
      throw new NotFoundException(`Trip Stop Time with ID ${id} Not Found.`);
    }
    return tripStopTime;
  }

  private checkTimeConstraint(
    trip: TripDocument,
    scheduledTime: Date,
    isInitialStop: boolean = false,
  ): void {
    const departureTime = trip.departureTime;
    const arrivalTime = trip.estimatedArrivalTime;

    // Điểm dừng phải nằm trong khoảng thời gian của chuyến đi
    if (scheduledTime < departureTime || scheduledTime > arrivalTime) {
      throw new BadRequestException(
        'The estimated time must fall between the estimated departure time and the estimated arrival time of the trip.',
      );
    }

    // Đảm bảo không trùng với thời gian khởi hành/đến (trừ khi là điểm đầu/cuối thực tế)
    if (
      !isInitialStop &&
      (scheduledTime.getTime() === departureTime.getTime() ||
        scheduledTime.getTime() === arrivalTime.getTime())
    ) {
      throw new BadRequestException(
        'The stopover time must not coincide with the departure or arrival time of the trip.',
      );
    }
  }
  async create(
    tripStopTimeData: CreateTripStopTimeDto,
  ): Promise<TripStopTimeDocument> {
    const { tripId, stopId, scheduledTime } = tripStopTimeData;

    // Kiểm tra tồn tại Khóa ngoại (Trip và BusStop)
    const [trip, stopExists] = await Promise.all([
      this.tripService.getById(tripId).catch(() => null), // Dùng catch để xử lý 404
      this.busStopService.exists(stopId),
    ]);

    if (!trip) {
      throw new NotFoundException(`Trip ID (${tripId}) không tồn tại.`);
    }
    if (!stopExists) {
      throw new NotFoundException(`Stop ID (${stopId}) không tồn tại.`);
    }

    // Kiểm tra Ràng buộc thời gian nghiệp vụ
    this.checkTimeConstraint(trip, new Date(scheduledTime));
    try {
      const newTripStopTime = new this.tripStopTimeModel(tripStopTimeData);
      return await newTripStopTime.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Stop already scheduled for this trip.');
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateData: UpdateTripStopTimeDto,
  ): Promise<TripStopTimeDocument> {
    const existingEntry = await this.tripStopTimeModel.findById(id).exec();
    if (!existingEntry) {
      throw new NotFoundException('Trip Stop Time Not Found');
    }

    // Lấy thông tin Trip nếu TripId thay đổi hoặc ScheduledTime thay đổi
    let trip: TripDocument;
    if (updateData.tripId || updateData.scheduledTime) {
      const currentTripId =
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        updateData.tripId || existingEntry.tripId.toString();
      trip = await this.tripService.getById(currentTripId);

      // Kiểm tra ràng buộc thời gian mới
      this.checkTimeConstraint(
        trip,
        new Date(updateData.scheduledTime || existingEntry.scheduledTime),
      );
    }

    // Kiểm tra StopId nếu có thay đổi
    if (updateData.stopId) {
      const stopExists = await this.busStopService.exists(updateData.stopId);
      if (!stopExists) {
        throw new NotFoundException(
          `Stop ID (${updateData.stopId}) không tồn tại.`,
        );
      }
    }

    const updatedTripStopTime = await this.tripStopTimeModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedTripStopTime) {
      throw new NotFoundException('Trip Stop Time Not Found');
    }
    return updatedTripStopTime;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.tripStopTimeModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Trip Stop Time not found');
    }
    return { message: 'Trip Stop Time has been deleted successfully.' };
  }

  async getTripStopTimes(tripId: string): Promise<TripStopTimeDocument[]> {
    return this.tripStopTimeModel.find({ tripId: tripId }).exec();
  }
}
