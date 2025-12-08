import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  getHello(): string {
    const message = this.appService.getHello();
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Welcome to TripGO API</title>
          <style>
              /* --- GLOBAL STYLES --- */
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  /* Nền Gradient Tím Xanh nhẹ nhàng */
                  background: linear-gradient(135deg, #e0f7fa 0%, #f3e5f5 100%);
                  color: #2c3e50;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  flex-direction: column;
                  text-align: center;
              }
              
              /* --- CARD CONTAINER --- */
              .container {
                  background: white;
                  padding: 40px 60px;
                  border-radius: 15px;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                  max-width: 500px;
                  width: 90%;
              }

              /* --- HEADER STYLES --- */
              h1 {
                  /* Hiệu ứng chữ Gradient Đỏ Tím */
                  background: linear-gradient(45deg, #ff6b6b, #8e44ad);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  font-size: 3.5em;
                  margin-bottom: 5px;
                  /* Thêm Shadow cho chữ */
                  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.05);
                  padding-bottom: 0;
              }
              
              /* --- PARAGRAPH STYLES --- */
              p {
                  font-size: 1.1em;
                  color: #7f8c8d;
                  line-height: 1.6;
                  margin-top: 5px;
              }

              /* --- LINK STYLES --- */
              a {
                  color: #3f51b5;
                  font-weight: bold;
                  text-decoration: none;
                  border-bottom: 1px dashed #3f51b5;
                  transition: color 0.3s;
              }
              a:hover {
                  color: #2c3e50;
                  border-bottom: 1px solid #2c3e50;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>${message}</h1>
              <p>The **TripGO API** is running successfully and ready to serve data requests.</p>
          </div>
      </body>
      </html>
    `;
  }
}
