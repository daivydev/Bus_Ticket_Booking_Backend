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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CheckoutDto } from '../booking/dto/Checkout.dto';
import { BookingStatus } from '../../common/enums/booking.enum';
import { Public } from '../../common/decorators/public.decorator';
import { Query, Req } from '@nestjs/common';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { VnpayService } from '../vnpay/vnpay.service';
@Controller('bookings')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly vnpayService: VnpayService,
  ) {}

  // @Public()
  // @Get('checkout/vnpay-return')
  // @HttpCode(HttpStatus.OK)
  // async handleVnpayReturn(@Query() query: any) {
  //   console.log('Đã nhận phản hồi từ VNPay');

  //   const secretKey = process.env.VNP_HASH_SECRET;
  //   let vnp_Params = { ...query };
  //   const secureHash = vnp_Params['vnp_SecureHash'];

  //   // 1. Loại bỏ các tham số không dùng để tính toán chữ ký
  //   delete vnp_Params['vnp_SecureHash'];
  //   delete vnp_Params['vnp_SecureHashType'];

  //   // 2. Sắp xếp lại object theo Alphabet
  //   // (Vì VNPay Service của bạn đã có hàm sortObject, hãy tận dụng nó)
  //   vnp_Params = this.vnpayService['sortObject'](vnp_Params);

  //   // 3. Tạo chuỗi băm để kiểm chứng (Dùng chuẩn encode: false như code mẫu VNPay)
  //   const signData = qs.stringify(vnp_Params, { encode: false });
  //   const hmac = crypto.createHmac('sha512', secretKey!);
  //   const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  //   // 4. So sánh chữ ký của bạn với chữ ký VNPay gửi về
  //   if (secureHash === signed) {
  //     const { vnp_ResponseCode, vnp_TxnRef } = query;
  //     const bookingId = vnp_TxnRef.split('_')[0];

  //     // Chỉ cập nhật DB nếu mã phản hồi là '00' (Thành công)
  //     if (vnp_ResponseCode === '00') {
  //       await this.bookingService.updateStatus(bookingId, BookingStatus.Paid);
  //       return {
  //         status: 'Success',
  //         message: 'Thanh toán thành công và xác thực chữ ký khớp.',
  //         bookingId,
  //       };
  //     } else {
  //       return {
  //         status: 'Fail',
  //         message: 'Giao dịch thất bại tại cổng VNPay',
  //         code: vnp_ResponseCode,
  //       };
  //     }
  //   } else {
  //     // Nếu chữ ký không khớp, tuyệt đối không cập nhật Database
  //     return {
  //       status: 'Fail',
  //       message:
  //         'Cảnh báo: Chữ ký không hợp lệ! Dữ liệu có thể đã bị can thiệp.',
  //     };
  //   }
  // }

  // @Post('checkout')
  // @HttpCode(HttpStatus.OK)
  // async checkout(@Body() checkoutDto: CheckoutDto, @Req() req: any) {
  //   const ipAddress = req.ip === '::1' ? '127.0.0.1' : req.ip || '127.0.0.1';
  //   return await this.bookingService.processCheckout(
  //     checkoutDto,
  //     ipAddress as string,
  //   );
  // }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkout(@Body() checkoutDto: CheckoutDto) {
    // Không còn cần Request hay IPAddress cho cổng thanh toán ngoài
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
