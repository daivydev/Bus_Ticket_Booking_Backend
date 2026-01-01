import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument, TicketStatus } from './ticket.schema';
import { BookingService } from '../booking/booking.service';
import { CreateTicketDto } from 'src/modules/ticket/dto/CreateTicket.dto';
import { UpdateTicketDto } from 'src/modules/ticket/dto/UpdateTicket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
  ) {}

  async getAll(): Promise<TicketDocument[]> {
    return this.ticketModel
      .find()
      .populate({
        path: 'bookingId',
        select: 'booking_date status total_amount',
      })
      .exec();
  }

  // Đếm số vé đã đặt cho một chuyến đi (Dùng cho BookingService)
  async countBookedTickets(tripId: string): Promise<number> {
    const bookings = await this.bookingService.getBookingsByTrip(tripId);
    const bookingIds = bookings.map((b) => b._id);

    // Đếm số vé đã tạo (trừ vé đã bị hủy)
    return this.ticketModel
      .countDocuments({
        bookingId: { $in: bookingIds },
        status: { $ne: TicketStatus.Cancelled },
      })
      .exec();
  }

  // Hủy tất cả vé liên quan đến một Booking (Dùng cho BookingService)
  async cancelTicketsForBooking(bookingId: string): Promise<void> {
    await this.ticketModel
      .updateMany(
        { bookingId: bookingId, status: { $ne: TicketStatus.Cancelled } },
        { $set: { status: TicketStatus.Cancelled } },
      )
      .exec();
  }

  async create(ticketData: CreateTicketDto): Promise<TicketDocument> {
    const { bookingId, seatNumber, deck, ticketCode } = ticketData;

    // Kiểm tra Booking tồn tại
    const booking = await this.bookingService.getById(bookingId);
    if (!booking)
      throw new NotFoundException(`Booking ID (${bookingId}) not found.`);

    const tripId = booking.tripId.toString();

    // Đảm bảo Seat/Deck chưa được đặt cho chuyến đi này
    // Tìm tất cả Bookings thuộc về Trip hiện tại
    const tripBookings = await this.bookingService.getBookingsByTrip(tripId);
    const tripBookingIds = tripBookings.map((b) => b._id.toString());

    // Kiểm tra xem đã có vé nào đang VALID hoặc USED với cùng seatNumber/deck trong trip này chưa
    const existingTicket = await this.ticketModel
      .findOne({
        bookingId: { $in: tripBookingIds },
        seatNumber: seatNumber,
        deck: deck,
        status: { $in: [TicketStatus.Valid, TicketStatus.Used] },
      })
      .exec();

    if (existingTicket) {
      throw new ConflictException(
        `Seat ${seatNumber} on deck ${deck} has been reserved for this trip.`,
      );
    }

    // Tạo Ticket (Kiểm tra ticketCode unique)
    try {
      const newTicket = new this.ticketModel(ticketData);
      return await newTicket.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          `Ticket Code (${ticketCode}) already exists.`,
        );
      }
      throw error;
    }
  }

  async getById(id: string): Promise<TicketDocument> {
    const ticket = await this.ticketModel
      .findById(id)
      .populate('bookingId')
      .exec();
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found.`);
    }
    return ticket;
  }

  async update(
    id: string,
    updateData: UpdateTicketDto,
  ): Promise<TicketDocument> {
    const updatedTicket = await this.ticketModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }
    return updatedTicket;
  }

  // --- DELETE (Chỉ nên hủy trạng thái) ---
  // Chỉ cập nhật status thành Cancelled
  async delete(id: string): Promise<{ message: string }> {
    const result = await this.ticketModel
      .findByIdAndUpdate(id, { status: TicketStatus.Cancelled }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException('Ticket not found');
    }
    return { message: 'Ticket status updated to Cancelled.' };
  }

  async updateStatusByBooking(
    bookingId: string,
    status: TicketStatus,
  ): Promise<void> {
    const result = await this.ticketModel
      .updateMany({ bookingId: bookingId }, { $set: { status: status } })
      .exec();

    if (result.matchedCount === 0) {
      console.warn(`No tickets found to update for Booking ID: ${bookingId}`);
    }
  }
}
