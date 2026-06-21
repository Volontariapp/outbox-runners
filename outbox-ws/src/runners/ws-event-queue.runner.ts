import type {
  EventQueueEntity,
  EventQueueModel,
  Repository,
  OutboxPusher,
} from '@volontariapp/database';
import { OutboxRunner } from '@volontariapp/database';
import type { OutboxRunnerConfig } from '@volontariapp/config';
import type { Logger } from '@volontariapp/logger';
import { EventQueueDispatcher } from '@volontariapp/outbox';
import { EventQueueRepository } from '../repositories/event-queue.repository.js';

export class WsEventQueueRunner extends OutboxRunner<
  EventQueueModel,
  EventQueueEntity
> {
  constructor(
    repository: Repository<EventQueueModel>,
    config: OutboxRunnerConfig,
    logger: Logger,
    pusher: OutboxPusher<EventQueueEntity>,
  ) {
    const outboxRepository = new EventQueueRepository(repository);
    const dispatcher = new EventQueueDispatcher(logger, outboxRepository);
    super(outboxRepository, config, dispatcher, pusher);
  }
}
