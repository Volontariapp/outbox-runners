import { PostgresProvider } from '@volontariapp/bridge';
import { PostgresBridgeHealthProvider } from '@volontariapp/health-check';
import { CustomConfig } from '../config/custom-config.js';

export const initDatabase = async (config: CustomConfig) => {
  const dbProvider = new PostgresProvider(config.db);
  await dbProvider.connect();
  
  const health = new PostgresBridgeHealthProvider(dbProvider);
  const status = await health.check();
  
  if (!status.isHealthy) {
    throw new Error();
  }
  
  return dbProvider;
};
