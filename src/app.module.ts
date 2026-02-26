import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AssetsModule } from './modules/assets/assets.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [TicketsModule, AssetsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
