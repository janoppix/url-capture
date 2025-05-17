import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join } from 'path';
import { readdir, stat, unlink } from 'fs/promises';

@Injectable()
export class ScreenshotCleanupService {
  private readonly logger = new Logger(ScreenshotCleanupService.name);
  private readonly screenshotDir = join(
    __dirname,
    '..',
    '..',
    'public',
    'screenshots',
  );
  private readonly maxAgeMs = 1 * 24 * 60 * 60 * 1000;

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    try {
      const files = await readdir(this.screenshotDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = join(this.screenshotDir, file);
        const stats = await stat(filePath);
        const age = now - stats.mtime.getTime();

        if (age > this.maxAgeMs) {
          await unlink(filePath);
          this.logger.log(`Archivo eliminado: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Error al limpiar capturas antiguas', error);
    }
  }
}
