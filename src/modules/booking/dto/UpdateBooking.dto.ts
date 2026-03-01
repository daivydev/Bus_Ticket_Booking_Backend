import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsMongoId, IsNumber, Min } from 'class-validator';
import { BookingStatus } from '../booking.schema';
import { CreateBookingDto } from '../../booking/dto/CreateBooking.dto';

// Kế thừa CreateBookingDto, nhưng loại bỏ các trường không nên thay đổi sau khi tạo
export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsIn(Object.values(BookingStatus))
  status?: BookingStatus;

  @IsMongoId()
  userId?: string;

  @IsMongoId()
  tripId?: string;

  @IsNumber()
  @Min(0)
  totalAmount?: number;
}
