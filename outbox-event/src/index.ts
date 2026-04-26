import 'reflect-metadata';
import { loadConfig } from '@volontariapp/config';
import { Logger } from '@volontariapp/logger';
import { CustomConfig } from './config/custom-config.js';
import { resolveConfigDirectory } from './config/resolve-config-directory.js';

function bootstrap() {
  const configDir = resolveConfigDirectory();
  const config = loadConfig(configDir, CustomConfig);
  
  const logger = new Logger({
    context: 'OUTBOX-EVENT',
    format: config.logger.format,
  });

  logger.info('Outbox runner for event starting (Pure Node.js)...');

  const interval = setInterval(() => {
    logger.info('Checking for new outbox messages...');
  }, 10000);

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down...');
    clearInterval(interval);
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down...');
    clearInterval(interval);
    process.exit(0);
  });
}

try {
  bootstrap();
} catch (err: unknown) {
  console.error(err);
  process.exit(1);
}
