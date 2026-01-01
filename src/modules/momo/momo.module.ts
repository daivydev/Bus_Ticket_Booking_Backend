import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MomoService } from './momo.service';

@Module({
  imports: [HttpModule],
  providers: [MomoService],
  exports: [MomoService],
})
export class MomoModule {}
