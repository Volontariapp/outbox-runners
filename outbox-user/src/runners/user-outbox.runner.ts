import {
  BaseRepository,
  JobsOutboxEntity,
  JobsOutboxModel,
  OutboxRunner,
  OutboxDispatcher,
  databaseMapper,
  type Repository,
} from '@volontariapp/database';
import type { OutboxRunnerConfig } from '@volontariapp/config';
import type { Logger } from '@volontariapp/logger';

databaseMapper.registerBidirectional(JobsOutboxModel, JobsOutboxEntity);

export class JobsOutboxRepository extends BaseRepository<
  JobsOutboxModel,
  JobsOutboxEntity,
  string
> {
  constructor(repository: Repository<JobsOutboxModel>) {
    super(repository, JobsOutboxEntity, JobsOutboxModel);
  }
}

export class UserOutboxRunner extends OutboxRunner<
  JobsOutboxModel,
  JobsOutboxEntity
> {
  constructor(
    repository: Repository<JobsOutboxModel>,
    config: OutboxRunnerConfig,
    logger: Logger,
  ) {
    const outboxRepository = new JobsOutboxRepository(repository);
    const dispatcher = new OutboxDispatcher(logger, outboxRepository);
    super(outboxRepository, config, dispatcher);
  }
}
