import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import * as fs from 'fs';

config();

async function bootstrap() {

  const httpsOptions = {
    key: fs.readFileSync('./secrets/server.key'),
    cert: fs.readFileSync('./secrets/server.cert'),
  };

  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.enableCors();
  Logger.log('CORS enabled', 'Main JWTAuth');

  await app.listen(port);
  Logger.log(`Application listening on port ${port}`, 'Main JWTAuth');
}
bootstrap();
