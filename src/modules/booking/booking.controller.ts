import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/CreateBooking.dto';
import { UpdateBookingDto } from './dto/UpdateBooking.dto';
import { BookingDocument } from './booking.schema';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { CheckoutDto } from 'src/modules/booking/dto/Checkout.dto';
import { BookingStatus } from 'src/common/enums/booking.enum';
import { Public } from 'src/common/decorators/public.decorator';
import * as crypto from 'crypto';

@Controller('bookings')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Public() // bỏ qua kiểm tra JWT
  @Post('checkout/momo-ipn')
  @HttpCode(HttpStatus.OK)
  async handleMomoIpn(@Body() body: any) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    // Tạo lại chữ ký từ dữ liệu nhận được để so sánh
    const secretKey = process.env.MOMO_SECRET_KEY as string;
    const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const checkSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== checkSignature) {
      console.error('Chữ ký không hợp lệ! Có thể có yêu cầu giả mạo.');
      return { message: 'Invalid Signature' };
    }

    // Nếu chữ ký đúng, tiếp tục xử lý
    const bookingId = orderId.split('_')[0];
    if (resultCode === 0) {
      await this.bookingService.updateStatus(bookingId, BookingStatus.Paid);
    }

    return { message: 'Success' };
  }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkout(@Body() checkoutDto: CheckoutDto) {
    return await this.bookingService.processCheckout(checkoutDto);
  }

  @Get()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async getAllBooking(): Promise<BookingDocument[]> {
    return this.bookingService.getAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getBookingById(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<BookingDocument> {
    return this.bookingService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingDocument> {
    return this.bookingService.create(createBookingDto);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateBooking(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<BookingDocument> {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete('/:id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.FORBIDDEN)
  async deleteBooking(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    return this.bookingService.delete(id);
  }
}
