import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/CreatePayment.dto';
import { UpdatePaymentDto } from './dto/UpdatePayment.dto';
import { PaymentDocument } from './payment.schema';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<PaymentDocument[]> {
    return this.paymentService.getAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.User)
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<PaymentDocument> {
    return this.paymentService.getById(id);
  }

  @Post()
  @Roles(Role.Admin, Role.User)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDocument> {
    return this.paymentService.create(createPaymentDto);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentDocument> {
    return this.paymentService.update(id, updatePaymentDto);
  }
}
