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
    @Query('selector') selector: string = '', // nuevo parámetro

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

    const imageUrl = await this.screenshotService.capture(
      url,
      viewport,
      selector,
    );
    const fullImageUrl = `https://servicios.adopslatam.com/captura${imageUrl}`;
    res.json({ imageUrl, fullImageUrl });
  }
}
