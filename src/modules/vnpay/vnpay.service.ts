import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import moment from 'moment';
import * as qs from 'qs';

@Injectable()
export class VnpayService {
  createPaymentUrl(bookingId: string, amount: number, ipAddress: string) {
    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    if (!secretKey) throw new Error('VNP_HASH_SECRET is missing');

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: `${bookingId}_${createDate}`,
      vnp_OrderInfo: `Thanh toan ve xe TripGO ${bookingId}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.floor(amount * 100),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate,
    };

    // 1. Sắp xếp tham số
    vnp_Params = this.sortObject(vnp_Params);

    // 2. Tạo chuỗi băm (Sử dụng chuẩn encode: false như code mẫu)
    const signData = qs.stringify(vnp_Params, { encode: false });

    // 3. Tạo chữ ký
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // 4. Tạo URL cuối cùng (Quan trọng: Phải encode các tham số trên URL)
    const finalQueryString = qs.stringify(vnp_Params, { encode: true });

    return `${vnpUrl}?${finalQueryString}&vnp_SecureHash=${signed}`;
  }

  private sortObject(obj: any) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }
}
