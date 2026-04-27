import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseConfig, PostgresConfig, OutboxRunnerConfig } from '@volontariapp/config';

export class CustomConfig extends BaseConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => PostgresConfig)
  db!: PostgresConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => OutboxRunnerConfig)
  outbox!: OutboxRunnerConfig;
}
