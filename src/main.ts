import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ADD THIS LINE: Enables global validation using your DTOs!
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips out extra fields not defined in the DTO
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  );

  await app.listen(3000);
}
bootstrap();
