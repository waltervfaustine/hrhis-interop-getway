import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChwModule } from './features/chw/chw.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ChwModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
