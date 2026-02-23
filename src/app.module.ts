import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './modules/tickets/tickets.module';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [TicketsModule, AssetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
