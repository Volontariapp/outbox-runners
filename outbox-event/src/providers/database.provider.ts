import { PostgresProvider } from '@volontariapp/bridge';
import { PostgresConfig } from '@volontariapp/config';

export async function initDatabase(config: PostgresConfig): Promise<PostgresProvider> {
  const dbProvider = new PostgresProvider(config);
  await dbProvider.connect();
  return dbProvider;
}
