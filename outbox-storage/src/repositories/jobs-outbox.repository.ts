import {
  BaseRepository,
  JobsOutboxEntity,
  JobsOutboxModel,
  databaseMapper,
  type Repository,
} from '@volontariapp/database';

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
