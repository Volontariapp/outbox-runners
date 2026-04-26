import 'reflect-metadata';
import { loadConfig } from '@volontariapp/config';
import { Logger } from '@volontariapp/logger';
import { CustomConfig } from './config/custom-config.js';
import { resolveConfigDirectory } from './config/resolve-config-directory.js';
import { initDatabase } from './providers/database.provider.js';

async function bootstrap() {
  const configDir = resolveConfigDirectory();
  const config = loadConfig(configDir, CustomConfig);
  const logger = new Logger({
    context: 'OUTBOX-SOCIAL',
    format: config.logger.format,
  });
  logger.info('Outbox runner for social starting (Lean Mode)...');
  const dbProvider = await initDatabase(config.db, logger);
  const interval = setInterval(() => {
    if (!dbProvider.isConnected()) {
      logger.error('Database connection lost! Shutting down for restart...');
      process.exit(1);
    }
    logger.info('Checking for new outbox messages...');
  }, 10000);
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    clearInterval(interval);
    await dbProvider.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
}

void bootstrap().catch((err: unknown) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
