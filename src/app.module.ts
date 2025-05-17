import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScreenshotController } from './screenshot/screenshot.controller';
import { ScreenshotService } from './screenshot/screenshot.service';

@Module({
  imports: [],
  controllers: [AppController, ScreenshotController],
  providers: [AppService, ScreenshotService],
})
export class AppModule {}
