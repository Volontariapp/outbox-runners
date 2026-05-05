import type {
  JobsOutboxEntity,
  JobsOutboxModel,
  Repository,
  OutboxPusher,
} from '@volontariapp/database';
import { OutboxRunner } from '@volontariapp/database';
import type { OutboxRunnerConfig } from '@volontariapp/config';
import type { Logger } from '@volontariapp/logger';
import { JobsOutboxDispatcher } from '@volontariapp/outbox';
import { JobsOutboxRepository } from '../repositories/jobs-outbox.repository.js';

export class UserJobsOutboxRunner extends OutboxRunner<
  JobsOutboxModel,
  JobsOutboxEntity
> {
  constructor(
    repository: Repository<JobsOutboxModel>,
    config: OutboxRunnerConfig,
    logger: Logger,
    pusher: OutboxPusher<JobsOutboxEntity>,
  ) {
    const outboxRepository = new JobsOutboxRepository(repository);
    const dispatcher = new JobsOutboxDispatcher(logger, outboxRepository);
    super(outboxRepository, config, dispatcher, pusher);
  }
}
