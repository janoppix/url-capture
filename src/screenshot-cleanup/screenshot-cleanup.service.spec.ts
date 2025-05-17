import { Test, TestingModule } from '@nestjs/testing';
import { ScreenshotCleanupService } from './screenshot-cleanup.service';

describe('ScreenshotCleanupService', () => {
  let service: ScreenshotCleanupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScreenshotCleanupService],
    }).compile();

    service = module.get<ScreenshotCleanupService>(ScreenshotCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
