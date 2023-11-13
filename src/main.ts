import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // to make nest work with request validators
  app.useGlobalPipes(
    new ValidationPipe({
      // If you don't want to pass to controllers all request fields that your didn't define in dtos.
      // whitelist: true
    }),
  );

  await app.listen(3000);
}
bootstrap();
