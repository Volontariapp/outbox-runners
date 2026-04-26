import 'reflect-metadata';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { loadConfig, BaseConfig, PostgresConfig } from '@volontariapp/config';
import { Logger } from '@volontariapp/logger';

class CustomConfig extends BaseConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => PostgresConfig)
  db!: PostgresConfig;
}

function resolveConfigDirectory(): string {
  const currentFileDir = dirname(fileURLToPath(import.meta.url));
  const repositoryRootDir = join(currentFileDir, '..');
  const rootConfigDir = join(repositoryRootDir, 'config');
  if (existsSync(rootConfigDir)) {
    return rootConfigDir;
  }
  throw new Error(`Config directory not found: ${rootConfigDir}`);
}

async function bootstrap() {
  const configDir = resolveConfigDirectory();
  const config = loadConfig(configDir, CustomConfig);
  
  const logger = new Logger({
    context: 'OUTBOX-POST',
    format: config.logger.format,
  });

  logger.info('Outbox runner for post starting (Pure Node.js)...');

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

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
