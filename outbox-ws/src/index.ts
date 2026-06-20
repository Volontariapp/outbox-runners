import 'reflect-metadata';
import { loadConfig } from '@volontariapp/config';
import { Logger } from '@volontariapp/logger';
import { JobsOutboxModel, EventQueueModel } from '@volontariapp/database';
import { JobsOutboxPusher, EventQueuePusher } from '@volontariapp/outbox';
import { CustomConfig } from './config/custom-config.js';
import { resolveConfigDirectory } from './config/resolve-config-directory.js';
import { initDatabase } from './providers/database.provider.js';
import { WsJobsOutboxRunner, WsEventQueueRunner } from './runners/index.js';
import { initRedis } from './providers/redis.provider.js';
import type { RedisProvider } from '@volontariapp/bridge';

async function bootstrap() {
  const configDir = resolveConfigDirectory();
  const config = loadConfig(configDir, CustomConfig);
  const logger = new Logger({
    context: 'OUTBOX-WS',
    format: config.logger.format,
  });

  logger.info('Outbox runner for websocket starting...');

  const dbProvider = await initDatabase(config.db, logger);
  const dataSource = dbProvider.getDriver();
  const redisProvider: RedisProvider = await initRedis(config.redis, logger);

  // Initialize Pushers
  const jobsPusher = new JobsOutboxPusher(logger, redisProvider.getDriver());
  const eventsPusher = new EventQueuePusher(logger, redisProvider.getDriver());

  // Initialize Jobs Runner
  const jobsRepository = dataSource.getRepository(JobsOutboxModel);
  const jobsRunner = new WsJobsOutboxRunner(
    jobsRepository,
    config.outbox,
    logger,
    jobsPusher,
  );

  // Initialize Events Runner
  const eventsRepository = dataSource.getRepository(EventQueueModel);
  const eventsRunner = new WsEventQueueRunner(
    eventsRepository,
    config.outbox,
    logger,
    eventsPusher,
  );

  // Start both runners
  logger.info('Starting Jobs and Events outbox runners...');
  jobsRunner.start();
  eventsRunner.start();

  const interval = setInterval(() => {
    if (!dbProvider.isConnected()) {
      logger.error('Database connection lost! Shutting down for restart...');
      process.exit(1);
    }
  }, 10000);

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    await Promise.all([
      jobsRunner.stop(),
      eventsRunner.stop(),
      jobsPusher.close(),
    ]);
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
