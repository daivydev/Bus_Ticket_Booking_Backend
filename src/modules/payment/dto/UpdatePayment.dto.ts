import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaymentStatus } from '../payment.schema';
import { CreatePaymentDto } from 'src/modules/payment/dto/CreatePayment.dto';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  transactionRef?: string;
}
