import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VnpayService } from './vnpay.service';

@Module({
  imports: [HttpModule],
  providers: [VnpayService],
  exports: [VnpayService],
})
export class VnpayModule {}
