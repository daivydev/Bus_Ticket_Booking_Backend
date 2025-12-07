import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// changing node version of nodejs from 24x to 20 solves the 500 internal server error in vercel
@Module({
  imports: [
    ConfigModule.forRoot(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URI as string),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
