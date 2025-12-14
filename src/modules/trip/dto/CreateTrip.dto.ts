import {
  IsMongoId,
  IsDateString,
  IsNumber,
  Min,
  IsNotEmpty,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Custom Validator: Đảm bảo thời gian đến phải sau thời gian khởi hành
@ValidatorConstraint({ name: 'isArrivalAfterDeparture', async: false })
export class IsArrivalAfterDepartureConstraint implements ValidatorConstraintInterface {
  validate(estimatedArrivalTime: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const departureTime = (args.object as any)[relatedPropertyName];
    return (
      new Date(estimatedArrivalTime).getTime() >
      new Date(departureTime).getTime()
    );
  }
  defaultMessage(args: ValidationArguments) {
    return 'Estimated arrival time must be strictly after the departure time.';
  }
}

export class CreateTripDto {
  @IsMongoId()
  @IsNotEmpty()
  routeId: string;

  @IsMongoId()
  @IsNotEmpty()
  busId: string;

  @IsDateString()
  @IsNotEmpty()
  departureTime: string;

  @IsDateString()
  @IsNotEmpty()
  @Validate(IsArrivalAfterDepartureConstraint, ['departureTime'], {
    message: 'Estimated arrival time must be later than departure time.',
  })
  estimatedArrivalTime: string;

  @IsNumber()
  @Min(0)
  basePrice: number;
}
