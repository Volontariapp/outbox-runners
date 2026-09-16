import {
  BaseRepository,
  EventQueueEntity,
  EventQueueModel,
  databaseMapper,
  type Repository,
} from '@volontariapp/database';

databaseMapper.registerBidirectional(EventQueueModel, EventQueueEntity);

export class EventQueueRepository extends BaseRepository<
  EventQueueModel,
  EventQueueEntity,
  string
> {
  constructor(repository: Repository<EventQueueModel>) {
    super(repository, EventQueueEntity, EventQueueModel);
  }
}
