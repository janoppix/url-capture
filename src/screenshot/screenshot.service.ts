import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { writeFile } from 'fs/promises';

@Injectable()
export class ScreenshotService {
  async capture(
    url: string,
    viewport: string,
    selector: string = '',
  ): Promise<string> {
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

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-ES', 'es'],
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel Iris OpenGL Engine';
        return getParameter(parameter);
      };
    });

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
      await page.setViewport({ width: 1920, height: 1080, isMobile: false });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/124.0.0.0 Safari/537.36',
      );
    }

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      console.log('iniciando espera', selector);
      if (selector) {
        await page.waitForSelector(selector, { timeout: 10000 });
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) {
            console.log('encontrado selector en el sitio');
            el.scrollIntoView({ behavior: 'instant', block: 'center' });
          } else {
            console.log('no hay selector en el sitio');
          }
        }, selector);
      } else {
        console.log('no se ingreso el selector');
        await page.evaluate(() => window.scrollBy(0, 300));
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await page.evaluate(() => window.scrollTo(0, 0));
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
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
