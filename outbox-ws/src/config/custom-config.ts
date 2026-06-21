import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  BaseConfig,
  PostgresConfig,
  OutboxRunnerConfig,
  RedisConfig,
} from '@volontariapp/config';

export class CustomConfig extends BaseConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => PostgresConfig)
  db!: PostgresConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => OutboxRunnerConfig)
  outbox!: OutboxRunnerConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => RedisConfig)
  redis!: RedisConfig;
}
