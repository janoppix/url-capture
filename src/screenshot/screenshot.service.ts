import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { writeFile } from 'fs/promises';

@Injectable()
export class ScreenshotService {
  async capture(url: string, viewport: string): Promise<string> {
    const uuid = uuidv4();
    const fileName = `${uuid}-${viewport}.png`;
    const filePath = join(
      __dirname,
      '..',
      '..',
      'public',
      'screenshots',
      fileName,
    );
    const publicUrl = `/screenshots/${fileName}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    if (viewport === 'mobile') {
      await page.setViewport({
        width: 375,
        height: 812,
        deviceScaleFactor: 3,
        isMobile: true,
      });

      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) ' +
          'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
      );
    } else {
      await page.setViewport({ width: 1366, height: 768 });
    }

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const screenshotBuffer = await page.screenshot({ fullPage: false });
      await writeFile(filePath, screenshotBuffer);
      await browser.close();

      return publicUrl;
    } catch (error) {
      await browser.close();
      throw new HttpException(
        'Error capturando la URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
