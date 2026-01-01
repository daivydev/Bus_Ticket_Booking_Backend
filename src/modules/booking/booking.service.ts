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
import { CheckoutDto } from 'src/modules/booking/dto/Checkout.dto';
import { PaymentService } from 'src/modules/payment/payment.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TicketStatus } from 'src/modules/ticket/ticket.schema';
import { PaymentStatus } from 'src/modules/payment/payment.schema';
import { VnpayService } from 'src/modules/vnpay/vnpay.service';
import { randomBytes } from 'crypto';

// Interface này được định nghĩa để giúp TypeScript nhận ra trường busId đã được populate
interface TripWithPopulatedBus {
  _id: MongooseSchema.Types.ObjectId;
  busId: Bus & { _id: MongooseSchema.Types.ObjectId; totalSeats: number };
  base_price: number;
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
    private vnpayService: VnpayService,
    private paymentService: PaymentService,
  ) {}

  async getAll(): Promise<BookingDocument[]> {
    return this.bookingModel
      .find()
      .populate('userId')
      .populate({
        path: 'tripId',
        populate: [{ path: 'busId' }, { path: 'routeId' }],
      })
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

  @Cron(CronExpression.EVERY_MINUTE) // Quét mỗi phút một lần
  async handleAutoCancellation() {
    const now = new Date();
    // 1. Tìm các Booking quá hạn mà vẫn đang ở trạng thái Pending
    const expiredBookings = await this.bookingModel.find({
      status: BookingStatus.Pending,
      expiresAt: { $lte: now, $ne: null },
    });

    if (expiredBookings.length === 0) return;

    for (const booking of expiredBookings) {
      const bookingId = booking._id.toString();

      // 2. Cập nhật Booking thành Cancelled
      booking.status = BookingStatus.Cancelled;
      await booking.save();

      // 3. Cập nhật Ticket thành Cancelled
      await this.ticketService.updateStatusByBooking(
        bookingId,
        TicketStatus.Cancelled,
      );

      // 4. Cập nhật Payment thành Failed
      await this.paymentService.updateStatusByBooking(
        bookingId,
        PaymentStatus.Failed,
      );

      console.log(
        `Booking ${bookingId} has been auto-cancelled due to timeout.`,
      );
    }
  }

  async create(
    bookingData: CreateBookingDto,
    numberOfTickets: number = 1,
  ): Promise<BookingDocument> {
    const { userId, tripId, pickupStopId, dropoffStopId } = bookingData;

    const [userExists, trip] = await Promise.all([
      this.userService.exists(userId),
      this.tripService.getById(tripId).catch(() => null),
    ]);

    if (!userExists || !trip) {
      throw new NotFoundException('User hoặc Trip không tồn tại.');
    }

    const basePrice = trip.get('basePrice') || (trip as any).basePrice;
    const totalAmount = basePrice * numberOfTickets;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      const newBooking = new this.bookingModel({
        userId: userId,
        tripId: tripId,
        pickupStopId: pickupStopId,
        dropoffStopId: dropoffStopId,
        totalAmount: totalAmount,
        expiresAt: expiresAt,
        status: BookingStatus.Pending,
      });
      const savedBooking = await newBooking.save();
      return savedBooking;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Thông tin đặt chỗ bị trùng lặp (Unique Index Booking).',
        );
      }

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
    const updateData: any = { status: status, booking_date: new Date() };
    if (status === BookingStatus.Paid) {
      updateData.$unset = { expiresAt: 1 };
    }
    const updatedBooking = await this.bookingModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    if (!updatedBooking) {
      throw new NotFoundException(`Booking with ID ${id} Not Found.`);
    }

    return updatedBooking;
  }

  async getBookingsByTrip(tripId: string): Promise<BookingDocument[]> {
    return this.bookingModel.find({ tripId: tripId }).exec();
  }

  // async processCheckout(checkoutData: CheckoutDto, ipAddress: string) {
  //   const { tickets, paymentMethod, platform, ...bookingInfo } = checkoutData;

  //   // 1. Tạo Booking
  //   const booking = await this.create(bookingInfo, tickets.length);

  //   // 2. Tạo Tickets
  //   for (const ticketData of tickets) {
  //     await this.ticketService.create({
  //       ...ticketData,
  //       bookingId: booking._id.toString(),
  //     });
  //   }

  //   // 3. Khởi tạo Payment record
  //   await this.paymentService.create({
  //     bookingId: booking._id.toString(),
  //     paymentMethod: paymentMethod,
  //     amountPaid: booking.totalAmount,
  //   });

  //   // 4. Xử lý thanh toán VNPay
  //   if (paymentMethod === 'vnpay') {
  //     const payUrl = this.vnpayService.createPaymentUrl(
  //       booking._id.toString(),
  //       booking.totalAmount,
  //       ipAddress,
  //     );

  //     return {
  //       payUrl: payUrl,
  //       bookingId: booking._id,
  //       expiresAt: (booking as any).expiresAt,
  //     };
  //   }

  //   return { bookingId: booking._id };
  // }
  generateTicketCode = () => randomBytes(4).toString('hex').toUpperCase();

  async processCheckout(checkoutData: CheckoutDto) {
    const { tickets, paymentMethod, ...bookingInfo } = checkoutData;

    // 1. Tạo Booking.
    const booking = await this.create(bookingInfo, tickets.length);
    const newId = booking._id.toString();
    try {
      // 2. Tạo Tickets
      for (const ticketData of tickets) {
        await this.ticketService.create({
          ...ticketData,
          bookingId: newId,
          status: TicketStatus.Valid,
          ticketCode: `TCK-${randomBytes(4).toString('hex').toUpperCase()}`,
        });
      }
      // 3. Tạo Payment
      await this.paymentService.create({
        bookingId: newId,
        paymentMethod: paymentMethod || 'Internal',
        amountPaid: booking.totalAmount,
        paymentStatus: PaymentStatus.Success,
      });
      // 4. Update trạng thái
      const updatedBooking = await this.bookingModel.findByIdAndUpdate(
        newId,
        {
          status: BookingStatus.Paid,
          booking_date: new Date(),
          $unset: { expiresAt: 1 },
        },
        { new: true },
      );
      return {
        status: 'Success',
        bookingId: updatedBooking?._id,
      };
    } catch (error) {
      throw new ConflictException('LỖI SAU KHI TẠO BOOKING:', error.message);
    }
  }

  async getBookingsByUser(userId: string): Promise<BookingDocument[]> {
    return this.bookingModel.find({ userId: userId }).exec();
  }
}
