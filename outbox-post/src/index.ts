import 'reflect-metadata';
import { loadConfig } from '@volontariapp/config';
import { Logger } from '@volontariapp/logger';
import { CustomConfig } from './config/custom-config.js';
import { resolveConfigDirectory } from './config/resolve-config-directory.js';
import { initDatabase } from './providers/database.provider.js';
import { initHealthCheck } from './providers/health-check.provider.js';

async function bootstrap() {
  const configDir = resolveConfigDirectory();
  const config = loadConfig(configDir, CustomConfig);
  
  const logger = new Logger({
    context: 'OUTBOX-POST',
    format: config.logger.format,
  });

  logger.info('Outbox runner for post starting (Pure Node.js)...');

  // Initialize DB Connection
  const dbProvider = await initDatabase(config.db);

  // Setup Health Check
  const healthServer = initHealthCheck(config.port, dbProvider, logger);

  const interval = setInterval(() => {
    logger.info('Checking for new outbox messages...');
  }, 10000);

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    clearInterval(interval);
    healthServer.close();
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
  console.error(err);
  process.exit(1);
});
