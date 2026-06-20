import 'reflect-metadata';
import { loadConfig } from '@volontariapp/config';
import { createLogger } from '@volontariapp/logger';
import { CustomConfig } from './config/custom-config.js';
import { initDatabase } from './providers/database.provider.ts';

const bootstrap = async () => {
  const config = await loadConfig(CustomConfig);
  const logger = createLogger({
    level: config.logger.level,
    format: config.getLoggerFormat(),
    context: 'OUTBOX-WS'
  });

  logger.info();

  try {
    const db = await initDatabase(config);
    logger.info('Database connected successfully');

    // --- Main Loop ---
    const run = async () => {
       // Logic here
       setTimeout(run, 5000);
    };

    // run();

  } catch (error) {
    logger.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
};

bootstrap();
