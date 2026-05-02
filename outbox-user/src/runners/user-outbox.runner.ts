import {
  BaseRepository,
  JobsOutboxEntity,
  JobsOutboxModel,
  OutboxRunner,
  databaseMapper,
  type Repository,
} from '@volontariapp/database';
import type { OutboxRunnerConfig } from '@volontariapp/config';

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
  constructor(repository: Repository<JobsOutboxModel>, config: OutboxRunnerConfig) {
    const outboxRepository = new JobsOutboxRepository(repository);
    super(outboxRepository, config);
  }
}
