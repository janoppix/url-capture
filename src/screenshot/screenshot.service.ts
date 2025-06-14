import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';

@Injectable()
export class ScreenshotService {
  private async setupBrowser() {
    const userDataDir = join(__dirname, '..', '..', 'browser-data');
    const cookiesPath = join(userDataDir, 'cookies.json');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      userDataDir,
    });

    const page = await browser.newPage();
    
    // Capturar logs del navegador
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🌐 [Browser ${type.toUpperCase()}] ${text}`);
    });

    // Cargar cookies si existen
    if (existsSync(cookiesPath)) {
      const cookiesString = await readFile(cookiesPath, 'utf8');
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
    }

    return { browser, page, cookiesPath };
  }

  async capture(
    url: string,
    viewport: string,
    selector: string = '',
    proyecto?: string,
  ): Promise<string> {
    const uuid = uuidv4();
    const date = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateString = `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    const fileName = `${dateString}-${uuid}-${viewport}.png`;
    const screenshotsBaseDir = join(
      __dirname,
      '..',
      '..',
      'public',
      'screenshots',
    );
    const projectDir = proyecto ? join(screenshotsBaseDir, proyecto) : screenshotsBaseDir;
    const { mkdir } = await import('fs/promises');
    await mkdir(projectDir, { recursive: true });
    const filePath = join(projectDir, fileName);
    const publicUrl = proyecto ? `/screenshots/${proyecto}/${fileName}` : `/screenshots/${fileName}`;

    const { browser, page, cookiesPath } = await this.setupBrowser();

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
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      );
    }

    try {
      // Primero visitamos Google
      console.log('📱 [Script] Visitando Google primero...');
      await page.goto('https://www.google.com', { 
        waitUntil: 'domcontentloaded',
        timeout: 0 
      });
      console.log('📱 [Script] Google cargado');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Luego visitamos la URL objetivo
      console.log('📱 [Script] Visitando URL objetivo...');
      try {
        await page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        console.log('📱 [Script] URL objetivo cargada inicialmente');
        
        // Esperar a que la red esté inactiva por un máximo de 30 segundos
        await Promise.race([
          page.waitForNetworkIdle({ idleTime: 1000, timeout: 0 }),
          new Promise((_, reject) => 
            setTimeout(() => {
              console.log('📱 [Script] Timeout esperando red inactiva, continuando...');
              reject(new Error('Network idle timeout'));
            }, 30000)
          )
        ]);
      } catch (error) {
        console.log('📱 [Script] Error o timeout en la carga de la URL:', error.message);
      }

      console.log('📱 [Script] Guardando cookies...');
      // Guardar cookies después de la navegación
      const cookies = await page.cookies();
      await writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
      console.log('📱 [Script] Cookies guardadas');

      console.log('📱 [Script] selector cargada', selector);
      if (selector) {
        try {
          // Intentamos esperar el selector por un tiempo máximo
          await Promise.race([
            page.waitForSelector(selector, { timeout: 30000 }),
            new Promise((_, reject) => 
              setTimeout(() => {
                console.log('📱 [Script] No se pudo encontrar el selector en el tiempo esperado, continuando...');
                reject(new Error('Selector timeout'));
              }, 30000)
            )
          ]);
        } catch (error) {
          console.log('📱 [Script] No se pudo encontrar el selector en el tiempo esperado, continuando...');
        }

        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          console.log('elemento encontrado:', el ? 'sí' : 'no');
          if (el) {
            console.log('encontrado selector en el sitio');
            el.scrollIntoView({ behavior: 'instant', block: 'center' });
          } else {
            console.log('no hay selector en el sitio');
          }
        }, selector);
      } else {
        console.log('📱 [Script] no se ingreso el selector');
        await page.evaluate(() => window.scrollBy(0, 300));
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await page.evaluate(() => window.scrollTo(0, 0));
      }

      // Esperar un tiempo fijo para que la publicidad se cargue
      console.log('📱 [Script] Esperando tiempo fijo para la captura...');
      await new Promise((resolve) => setTimeout(resolve, 15000));

      // Intentar tomar la captura incluso si los anuncios siguen cargando
      console.log('📱 [Script] Tomando captura...');
      const screenshotBuffer = await page.screenshot({ fullPage: false });
      await writeFile(filePath, screenshotBuffer);
      await browser.close();

      return publicUrl;
    } catch (error) {
      await browser.close();
      console.error('📱 [Script] Error capturando la URL:', {
        url,
        selector,
        message: error.message,
        stack: error.stack,
      });
      throw new HttpException(
        `Error capturando la URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
