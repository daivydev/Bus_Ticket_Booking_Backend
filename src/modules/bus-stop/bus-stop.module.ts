import { Module } from '@nestjs/common';
import { BusStopController } from './bus-stop.controller';
import { BusStopService } from './bus-stop.service';

@Module({
  controllers: [BusStopController],
  providers: [BusStopService]
})
export class BusStopModule {}
