import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScreenshotController } from './screenshot/screenshot.controller';
import { ScreenshotService } from './screenshot/screenshot.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ScreenshotCleanupService } from './screenshot-cleanup/screenshot-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController, ScreenshotController],
  providers: [AppService, ScreenshotService, ScreenshotCleanupService],
})
export class AppModule {}
