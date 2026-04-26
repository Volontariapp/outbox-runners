import http from 'node:http';
import { Logger } from '@volontariapp/logger';
import { PostgresProvider } from '@volontariapp/bridge';
import { 
  DatabaseHealthOrchestrator, 
  PostgresBridgeHealthProvider 
} from '@volontariapp/health-check';

export function initHealthCheck(
  port: number,
  dbProvider: PostgresProvider,
  logger: Logger
): http.Server {
  const postgresHealthProvider = new PostgresBridgeHealthProvider(dbProvider);
  const healthOrchestrator = new DatabaseHealthOrchestrator([postgresHealthProvider]);

  const server = http.createServer((req, res) => {
    void (async () => {
      if (req.url === '/health') {
        const result = await healthOrchestrator.run();
        res.writeHead(result.status === 'ok' ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } else {
        res.writeHead(404);
        res.end();
      }
    })();
  });

  server.listen(port, () => {
    logger.info(`Health check server listening on port ${String(port)}`);
  });

  return server;
}
