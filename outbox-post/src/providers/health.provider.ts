import { createServer, type Server } from 'node:http';
import type { PostgresProvider, RedisProvider } from '@volontariapp/bridge';
import {
  DatabaseHealthOrchestrator,
  PostgresBridgeHealthProvider,
  RedisBridgeHealthProvider,
} from '@volontariapp/health-check';
import type { Logger } from '@volontariapp/logger';

const HEALTH_PATH = '/health';

export function startHealthServer(
  port: number,
  dbProvider: PostgresProvider,
  redisProvider: RedisProvider,
  logger: Logger,
): Server {
  const orchestrator = new DatabaseHealthOrchestrator([
    new PostgresBridgeHealthProvider(dbProvider),
    new RedisBridgeHealthProvider(redisProvider),
  ]);

  const server = createServer((req, res) => {
    if (req.method !== 'GET' || req.url !== HEALTH_PATH) {
      res.writeHead(404).end();
      return;
    }

    orchestrator.run().then(
      (result) => {
        res
          .writeHead(result.status === 'ok' ? 200 : 503, {
            'Content-Type': 'application/json',
          })
          .end(JSON.stringify(result));
      },
      (err: unknown) => {
        logger.error('Health check failed', { err });
        res.writeHead(503).end();
      },
    );
  });

  server.listen(port, () => {
    logger.info('Health endpoint listening', { port, path: HEALTH_PATH });
  });

  return server;
}

export function closeHealthServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}
