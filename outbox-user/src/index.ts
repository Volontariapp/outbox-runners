import 'reflect-metadata';
import { loadConfig } from '@volontariapp/config';
import { Logger } from '@volontariapp/logger';
import { JobsOutboxModel } from '@volontariapp/database';
import { CustomConfig } from './config/custom-config.js';
import { resolveConfigDirectory } from './config/resolve-config-directory.js';
import { initDatabase } from './providers/database.provider.js';
import { UserOutboxRunner } from './runners/user-outbox.runner.js';

async function bootstrap() {
  const configDir = resolveConfigDirectory();
  const config = loadConfig(configDir, CustomConfig);
  const logger = new Logger({
    context: 'OUTBOX-USER',
    format: config.logger.format,
  });

  logger.info('Outbox runner for user starting...');

  const dbProvider = await initDatabase(config.db, logger);
  const dataSource = dbProvider.getDriver();
  const repository = dataSource.getRepository(JobsOutboxModel);

  const runner = new UserOutboxRunner(repository, config.outbox);

  // Start the runner
  void runner.start().catch((err: unknown) => {
    logger.error('Outbox runner failed', { err });
    process.exit(1);
  });

  const interval = setInterval(() => {
    if (!dbProvider.isConnected()) {
      logger.error('Database connection lost! Shutting down for restart...');
      process.exit(1);
    }
  }, 10000);

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    runner.stop();
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
