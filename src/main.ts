import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // Cho phép DTO hoạt động chỉ với các trường đã định nghĩa (bảo mật)
      whitelist: true,
      // Tự động chuyển đổi kiểu dữ liệu cơ bản
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      // 'https://ten-mien-frontend-cua-ban.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức được phép
    credentials: true, // Cho phép truyền cookie và Authorization header
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
