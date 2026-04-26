import { PostgresProvider } from '@volontariapp/bridge';
import type { PostgresConfig } from '@volontariapp/config';
import type { Logger } from '@volontariapp/logger';

export async function initDatabase(
  config: PostgresConfig,
  logger: Logger,
): Promise<PostgresProvider> {
  const dbProvider = new PostgresProvider(config);

  try {
    await dbProvider.connect();
    // Explicit ping to ensure the connection is actually usable
    await dbProvider.getDriver().query('SELECT 1');
    logger.info('Database connection verified and ready');
    return dbProvider;
  } catch (err: unknown) {
    logger.error('Failed to initialize database connection', { err });
    throw err;
  }
}
