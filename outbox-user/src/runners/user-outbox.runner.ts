import { Redis } from 'ioredis';
import {
  BaseRepository,
  JobsOutboxEntity,
  JobsOutboxModel,
  OutboxRunner,
  OutboxDispatcher,
  OutboxPusher,
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

export class UserOutboxPusher extends OutboxPusher<JobsOutboxEntity> {
  private readonly redis: Redis;

  constructor() {
    super();
    this.redis = new Redis({
      port: 6379,
    });
  }

  public override async pushElement(entity: JobsOutboxEntity): Promise<void> {
    await this.redis.set(`outbox:${entity.id}`, JSON.stringify(entity));
  }

  public override async pushBulkElement(entities: JobsOutboxEntity[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    for (const entity of entities) {
      pipeline.set(`outbox:${entity.id}`, JSON.stringify(entity));
    }
    await pipeline.exec();
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
    const pusher = new UserOutboxPusher();
    super(outboxRepository, config, dispatcher, pusher);
  }
}
