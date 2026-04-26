import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseConfig, PostgresConfig } from '@volontariapp/config';

export class CustomConfig extends BaseConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => PostgresConfig)
  db!: PostgresConfig;
}
