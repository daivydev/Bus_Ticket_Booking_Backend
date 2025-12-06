import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { createServer, proxy } from 'aws-serverless-express';
import { Server } from 'http';
import { eventContext } from 'aws-serverless-express/middleware';

// ----------------------------------------------------
// 1. Cấu hình cho Môi trường Serverless (Vercel/Lambda)
// ----------------------------------------------------

let cachedServer: Server;
const API_PREFIX = 'api'; // Tách biến prefix ra

async function bootstrapServer(): Promise<Server> {
  // Khởi tạo Express App
  const expressApp = express();

  // Áp dụng middleware eventContext() SỚM để tránh lỗi TS2322
  expressApp.use(eventContext());

  const adapter = new ExpressAdapter(expressApp);

  // Tạo NestJS App
  const nestApp = await NestFactory.create(AppModule, adapter, {
    // Tùy chọn: Tăng tốc khởi tạo bằng cách tắt logger nếu cần
    // logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Áp dụng Global Prefix
  nestApp.setGlobalPrefix(API_PREFIX);

  // Khởi tạo NestJS Modules
  await nestApp.init();

  // Tạo HTTP Server và trả về (tham số thứ 3 là binaryMimeTypes, để trống là [])
  return createServer(expressApp, undefined, []);
}

/**
 * Hàm Handler chính được Vercel (sử dụng @vercel/node) gọi.
 * Đây là điểm vào Serverless Function.
 */
export async function handler(event: any, context: any): Promise<any> {
  // Logic Cold Start: Đảm bảo Server chỉ được tạo MỘT LẦN (cached)
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }

  // Proxy request (event/context) đến NestJS Server
  return proxy(cachedServer, event, context, 'PROMISE').promise;
}

// ----------------------------------------------------
// 2. Cấu hình cho Môi trường Local (Development)
// ----------------------------------------------------

// Nếu không phải chạy Serverless Function, ta chạy server cục bộ
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  async function localMain() {
    // Tạo ứng dụng NestJS truyền thống (Không cần Express Adapter)
    const app = await NestFactory.create(AppModule);

    // Áp dụng prefix giống như Serverless để đồng bộ đường dẫn
    app.setGlobalPrefix(API_PREFIX);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(
      `\n🚀 Application is running in Development Mode on: http://localhost:${port}/${API_PREFIX}`,
    );
  }

  localMain();
}
