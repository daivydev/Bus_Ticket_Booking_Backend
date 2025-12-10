import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { PaymentStatus } from '../payment.schema';

export class CreatePaymentDto {
  @IsMongoId()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  paymentMethod: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amountPaid: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  transactionRef?: string;
}
