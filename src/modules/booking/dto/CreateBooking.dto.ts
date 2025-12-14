import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Custom Validator: Đảm bảo điểm đón và điểm trả không trùng nhau
@ValidatorConstraint({ name: 'isDifferentStops', async: false })
export class IsDifferentStopsConstraint implements ValidatorConstraintInterface {
  validate(dropoffStopId: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const pickupStopId = (args.object as any)[relatedPropertyName];
    return dropoffStopId !== pickupStopId;
  }

  defaultMessage(args: ValidationArguments) {
    return 'The pickup and drop-off points must not be the same.';
  }
}
export class CreateBookingDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  tripId: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsMongoId()
  @IsNotEmpty()
  pickupStopId: string;

  @IsMongoId()
  @IsNotEmpty()
  @Validate(IsDifferentStopsConstraint, ['pickupStopId'], {
    message: 'The drop-off point must not coincide with the pickup point.',
  })
  dropoffStopId: string;
}
