import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MomoService {
  constructor(private readonly httpService: HttpService) {}

  async createPayment(
    bookingId: string,
    amount: number,
    clientType: 'web' | 'mobile',
  ) {
    const momoEndpoint = process.env.MOMO_API_URL;
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = <string>process.env.MOMO_SECRET_KEY;
    const orderId = `${bookingId}_${Date.now()}`;
    const requestId = orderId;
    const orderInfo = `Thanh toán vé xe TripGO đơn hàng #${bookingId}`;
    const ipnUrl = <string>process.env.MOMO_NOTIFY_URL;
    const requestType = 'payWithATM';
    const extraData = '';
    const redirectUrl =
      clientType === 'web'
        ? (process.env.MOMO_REDIRECT_URL as string)
        : (process.env.MOMO_REDIRECT_URL_MOBILE as string);

    // 1. Tạo chuỗi ký tự theo quy tắc MoMo (Thứ tự bảng chữ cái)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    // 2. Tạo Signature HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    const requestBody = {
      partnerCode,
      partnerName: 'TripGO',
      storeId: 'TripGO',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      extraData,
      requestType,
      signature,
    };
    const response = await firstValueFrom(
      this.httpService.post(momoEndpoint as string, requestBody),
    );
    return response.data; // Trả về payUrl
  }
}
