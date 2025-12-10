import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { BookingStatus } from 'src/common/enums/booking.enum';
import { Booking, BookingDocument } from 'src/modules/booking/booking.schema';
import { CreateBookingDto } from 'src/modules/booking/dto/CreateBooking.dto';
import { UpdateBookingDto } from 'src/modules/booking/dto/UpdateBooking.dto';
import { BusStopService } from 'src/modules/bus-stop/bus-stop.service';
import { TripStopTimeService } from 'src/modules/trip-stop-time/trip-stop-time.service';
import { TripService } from 'src/modules/trip/trip.service';
import { UserService } from 'src/modules/user/user.service';
import { TicketService } from 'src/modules/ticket/ticket.service';
import { Bus } from 'src/modules/bus/bus.chema';

// Interface này được định nghĩa để giúp TypeScript nhận ra trường busId đã được populate
interface TripWithPopulatedBus {
  busId: Bus & { _id: MongooseSchema.Types.ObjectId; totalSeats: number };
  routeId: {
    basePrice: number;
    markup: number;
    _id: MongooseSchema.Types.ObjectId;
  };
}

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private userService: UserService,
    private tripService: TripService,
    private stopService: BusStopService,
    private tripStopTimeService: TripStopTimeService,
    private ticketService: TicketService,
  ) {}

  async getAll(): Promise<BookingDocument[]> {
    return this.bookingModel
      .find()
      .populate('userId')
      .populate({ path: 'tripId', populate: { path: 'busId' } })
      .populate('pickupStopId')
      .populate('dropoffStopId')
      .exec();
  }

  async getById(id: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} Not Found.`);
    }
    return booking;
  }

  private async validateStopsAndTiming(
    tripId: string,
    pickupStopId: string,
    dropoffStopId: string,
  ): Promise<void> {
    const tripStops = await this.tripStopTimeService.getTripStopTimes(tripId);
    const pickupTimeEntry = tripStops.find(
      (t) => t.stopId.toString() === pickupStopId,
    );
    const dropoffTimeEntry = tripStops.find(
      (t) => t.stopId.toString() === dropoffStopId,
    );

    // Kiểm tra tính hợp lệ của Stops
    if (!pickupTimeEntry || !dropoffTimeEntry) {
      throw new BadRequestException(
        'The pickup or drop-off point is not a valid stop for this trip.',
      );
    }

    // Kiểm tra loại Stop
    if (!['Pickup', 'Both'].includes(pickupTimeEntry.stopType)) {
      throw new BadRequestException(
        'The selected pickup point is not the designated pickup point for the trip.',
      );
    }
    if (!['Dropoff', 'Both'].includes(dropoffTimeEntry.stopType)) {
      throw new BadRequestException(
        'The selected drop-off point is not the actual drop-off point for the trip.',
      );
    }

    // Kiểm tra thứ tự thời gian
    if (pickupTimeEntry.scheduledTime >= dropoffTimeEntry.scheduledTime) {
      throw new BadRequestException(
        'The pickup time must be strictly in advance of the drop-off time.',
      );
    }
  }

  async create(bookingData: CreateBookingDto): Promise<BookingDocument> {
    const { userId, tripId, pickupStopId, dropoffStopId } = bookingData;

    // Kiểm tra tồn tại Khóa ngoại (Đảm bảo TripService.getById có .populate('busId'))
    const [userExists, trip, pickupStopExists, dropoffStopExists] =
      await Promise.all([
        this.userService.exists(userId),
        this.tripService.getById(tripId).catch(() => null), // Nếu trip không tồn tại, sẽ là null
        this.stopService.exists(pickupStopId),
        this.stopService.exists(dropoffStopId),
      ]);

    if (!userExists || !pickupStopExists || !dropoffStopExists) {
      throw new NotFoundException('One of the IDs (User, Stop) is invalid.');
    }
    if (!trip) {
      throw new NotFoundException(`Trip ID (${tripId}) Not Found.`);
    }

    // Kiểm tra ràng buộc Stops và Thời gian
    await this.validateStopsAndTiming(tripId, pickupStopId, dropoffStopId);

    // Kiểm tra sức chứa (Seat Availability)
    const populatedTrip = trip as unknown as TripWithPopulatedBus;

    const totalSeats = populatedTrip.busId.totalSeats;
    const bookedSeats = await this.ticketService.countBookedTickets(tripId);

    if (bookedSeats >= totalSeats) {
      throw new ConflictException('Chuyến đi đã đầy, không còn ghế trống.');
    }

    // Tính toán giá tiền chính xác (basePrice * markup) nếu cần
    const basePrice = populatedTrip.routeId.basePrice;
    const markup = populatedTrip.routeId.markup;
    if (basePrice === undefined || markup === undefined) {
      throw new BadRequestException(
        'No basic price or markup information for the route was found.',
      );
    }
    const calculatedTotalAmount = basePrice * (1 + markup);
    bookingData.totalAmount = calculatedTotalAmount;

    // Tạo Booking
    try {
      const newBooking = new this.bookingModel(bookingData);
      return await newBooking.save();
    } catch (error) {
      if (error.code === 11000)
        throw new ConflictException('Booking already exists.');
      throw error;
    }
  }

  async update(
    id: string,
    bookingData: UpdateBookingDto,
  ): Promise<BookingDocument> {
    const existingBooking = await this.bookingModel.findById(id).exec();
    if (!existingBooking) {
      throw new NotFoundException('Booking Not Found');
    }

    // Ràng buộc cập nhật sau khi thanh toán
    if (existingBooking.status === BookingStatus.Paid) {
      const mutableFields = ['status', 'totalAmount'];
      const changes = Object.keys(bookingData).filter(
        (key) => !mutableFields.includes(key),
      );

      if (changes.length > 0) {
        throw new ConflictException(
          'Trip details/stops cannot be changed after payment.',
        );
      }
    }

    // Hủy vé khi Booking bị hủy
    if (
      bookingData.status === BookingStatus.Cancelled &&
      existingBooking.status !== BookingStatus.Cancelled
    ) {
      await this.ticketService.cancelTicketsForBooking(id);
    }

    // Thực hiện Update
    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(id, bookingData, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedBooking) {
      throw new NotFoundException('Booking Not Found');
    }
    return updatedBooking;
  }

  async delete(id: string): Promise<void> {
    throw new ConflictException(
      "You are not allowed to delete the booking record. Please update the status to 'Cancelled'.",
    );
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
  ): Promise<BookingDocument> {
    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(
        id,
        { status: status, booking_date: new Date() },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${id} Not Found.`);
    }

    // Nếu trạng thái chuyển sang Paid, bạn có thể thực hiện thêm các nghiệp vụ khác ở đây (ví dụ: gửi email xác nhận)
    return updatedBooking;
  }

  async getBookingsByTrip(tripId: string): Promise<BookingDocument[]> {
    return this.bookingModel.find({ tripId: tripId }).exec();
  }
}
