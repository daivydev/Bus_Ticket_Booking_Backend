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
import { Payment, PaymentDocument, PaymentStatus } from './payment.schema';
import { BookingService } from '../booking/booking.service';
import { BookingStatus } from 'src/common/enums/booking.enum';
import { CreatePaymentDto } from 'src/modules/payment/dto/CreatePayment.dto';
import { UpdatePaymentDto } from 'src/modules/payment/dto/UpdatePayment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
  ) {}

  async getAll(): Promise<PaymentDocument[]> {
    return this.paymentModel.find().populate('bookingId').exec();
  }

  async getById(id: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel
      .findById(id)
      .populate('bookingId')
      .exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }
    return payment;
  }

  // async create(paymentData: CreatePaymentDto): Promise<PaymentDocument> {
  //   const { bookingId, amountPaid } = paymentData;

  //   // Kiểm tra Booking tồn tại và chưa có giao dịch SUCCESS
  //   const booking = await this.bookingService.getById(bookingId);
  //   if (!booking) {
  //     throw new NotFoundException(`Booking ID (${bookingId}) Not Found.`);
  //   }

  //   // Kiểm tra số tiền
  //   if (booking.totalAmount !== amountPaid) {
  //     throw new BadRequestException(
  //       `Amount paid (${amountPaid}) does not match booking total (${booking.totalAmount}).`,
  //     );
  //   }

  //   // 3. Kiểm tra Booking đã được thanh toán chưa
  //   if (booking.status === BookingStatus.Paid) {
  //     throw new ConflictException(`Booking ID (${bookingId}) has been paid.`);
  //   }

  //   // Tạo bản ghi Payment
  //   try {
  //     const newPayment = new this.paymentModel(paymentData);
  //     return await newPayment.save();
  //   } catch (error) {
  //     // Bắt lỗi unique constraint (nếu bookingId đã có bản ghi payment)
  //     if (error.code === 11000) {
  //       throw new ConflictException(
  //         `A payment record already exists for Booking ID (${bookingId}).`,
  //       );
  //     }
  //     throw error;
  //   }
  // }

  // Xử lý Webhook hoặc Cổng thanh toán trả về

  async create(paymentData: CreatePaymentDto): Promise<PaymentDocument> {
    const { bookingId, amountPaid, paymentStatus } = paymentData;

    // 1. Kiểm tra Booking tồn tại
    const booking = await this.bookingService.getById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking ID (${bookingId}) Not Found.`);
    }

    // 2. Kiểm tra số tiền khớp với Booking
    if (booking.totalAmount !== amountPaid) {
      throw new BadRequestException(
        `Amount paid (${amountPaid}) does not match booking total (${booking.totalAmount}).`,
      );
    }
    if (
      paymentStatus !== PaymentStatus.Success &&
      booking.status === BookingStatus.Paid
    ) {
      throw new ConflictException(
        `Booking ID (${bookingId}) has already been paid.`,
      );
    }

    try {
      const newPayment = new this.paymentModel(paymentData);
      console.log(newPayment);
      const res = await newPayment.save();
      console.log('luu thanh cong payment');
      return res;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          `A payment record already exists for Booking ID (${bookingId}).`,
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateData: UpdatePaymentDto,
  ): Promise<PaymentDocument> {
    const existingPayment = await this.paymentModel.findById(id).exec();
    if (!existingPayment) {
      throw new NotFoundException('Payment record not found.');
    }

    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    if (!updatedPayment) {
      throw new NotFoundException('Payment record not found.');
    }

    // Nếu trạng thái chuyển sang SUCCESS, cập nhật Booking
    if (updatedPayment.paymentStatus === PaymentStatus.Success) {
      await this.bookingService.updateStatus(
        updatedPayment.bookingId.toString(),
        BookingStatus.Paid,
      );
    }

    return updatedPayment;
  }

  // Chỉ thay đổi trạng thái.
  async delete(id: string): Promise<void> {
    throw new BadRequestException('Payment records cannot be deleted.');
  }

  async updateStatusByBooking(
    bookingId: string,
    status: PaymentStatus,
  ): Promise<void> {
    const result = await this.paymentModel
      .findOneAndUpdate(
        { bookingId: bookingId },
        { $set: { paymentStatus: status } },
        { new: true },
      )
      .exec();

    if (!result) {
      console.warn(
        `No payment record found to update for Booking ID: ${bookingId}`,
      );
    }
  }
}
