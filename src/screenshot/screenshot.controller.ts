import {
  Controller,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ScreenshotService } from './screenshot.service';
import { Response } from 'express';

@Controller('screenshot')
export class ScreenshotController {
  constructor(private readonly screenshotService: ScreenshotService) {}

  @Get()
  async getScreenshot(
    @Query('url') url: string,
    @Query('viewport') viewport: string = 'desktop',
    @Res() res: Response,
  ) {
    if (!url) {
      throw new HttpException('Missing URL parameter', HttpStatus.BAD_REQUEST);
    }

    if (!['desktop', 'mobile'].includes(viewport)) {
      throw new HttpException(
        'Invalid viewport. Use "desktop" or "mobile"',
        HttpStatus.BAD_REQUEST,
      );
    }

    const imageUrl = await this.screenshotService.capture(url, viewport);
    res.json({ imageUrl });
  }
}
