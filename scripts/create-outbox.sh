#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BOLD}${CYAN}═══ Create New Outbox Runner ═══${NC}\n"

read -rp "Enter outbox name (e.g. 'user'): " NAME

if [ -z "$NAME" ]; then
    echo -e "${RED}Error: Name is required${NC}"
    exit 1
fi

DIR_NAME="outbox-$NAME"
TARGET_DIR="${ROOT_DIR}/${DIR_NAME}"

if [ -d "$TARGET_DIR" ]; then
    echo -e "${RED}Error: Directory ${DIR_NAME} already exists${NC}"
    exit 1
fi

echo -e "\nCreating ${BOLD}${DIR_NAME}${NC} at ${TARGET_DIR}..."

mkdir -p "${TARGET_DIR}/src/config"
mkdir -p "${TARGET_DIR}/src/providers"

# Create package.json
cat <<EOM > "${TARGET_DIR}/package.json"
{
  "name": "${DIR_NAME}",
  "version": "0.0.1",
  "type": "module",
  "private": true,
  "packageManager": "yarn@4.12.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "start:local": "NODE_ENV=local tsx src/index.ts",
    "start:dev": "NODE_ENV=development tsx src/index.ts",
    "start:test": "NODE_ENV=test tsx src/index.ts",
    "start:prod": "NODE_ENV=production node dist/index.js",
    "test": "jest",
    "lint": "eslint \"src/**/*.ts\" --fix"
  },
  "dependencies": {
    "@volontariapp/bridge": "0.2.8",
    "@volontariapp/config": "2.0.0",
    "@volontariapp/health-check": "0.1.10",
    "@volontariapp/logger": "0.2.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.15.1",
    "pg": "^8.20.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.28"
  },
  "devDependencies": {
    "@types/node": "^22.10.7",
    "@volontariapp/eslint-config": "2.2.2",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^16.0.0",
    "prettier": "^3.4.2",
    "tsx": "^4.21.0",
    "typescript": "5.7.3",
    "typescript-eslint": "^8.20.0"
  }
}
EOM

# Create tsconfig.json
cat <<EOM > "${TARGET_DIR}/tsconfig.json"
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
EOM

# Create eslint.config.mjs
cat <<EOM > "${TARGET_DIR}/eslint.config.mjs"
import volontariappConfig from '@volontariapp/eslint-config';
import globals from 'globals';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  ...volontariappConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
EOM

# Create config files
mkdir -p "${TARGET_DIR}/config"
cat <<EOM > "${TARGET_DIR}/config/default.config.json"
{
  "db": {
    "host": "localhost",
    "port": 5432,
    "username": "user",
    "password": "password",
    "database": "ms_${NAME}",
    "maxPoolSize": 10,
    "ssl": false
  },
  "logger": {
    "level": "info",
    "format": "text"
  },
  "port": 4199
}
EOM

# Create Boilerplate Code
cat <<EOM > "${TARGET_DIR}/src/config/custom-config.ts"
import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseConfig, PostgresConfig } from '@volontariapp/config';

export class CustomConfig extends BaseConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => PostgresConfig)
  db!: PostgresConfig;
}
EOM

cat <<EOM > "${TARGET_DIR}/src/providers/database.provider.ts"
import { PostgresProvider } from '@volontariapp/bridge';
import { PostgresBridgeHealthProvider } from '@volontariapp/health-check';
import { CustomConfig } from '../config/custom-config.js';

export const initDatabase = async (config: CustomConfig) => {
  const dbProvider = new PostgresProvider(config.db);
  await dbProvider.connect();
  
  const health = new PostgresBridgeHealthProvider(dbProvider);
  const status = await health.check();
  
  if (!status.isHealthy) {
    throw new Error(`Database health check failed: ${status.error}`);
  }
  
  return dbProvider;
};
EOM

cat <<EOM > "${TARGET_DIR}/src/index.ts"
import 'reflect-metadata';
import { loadConfig } from '@volontariapp/config';
import { createLogger } from '@volontariapp/logger';
import { CustomConfig } from './config/custom-config.js';
import { initDatabase } from './providers/database.provider.ts';

const bootstrap = async () => {
  const config = await loadConfig(CustomConfig);
  const logger = createLogger({
    level: config.logger.level,
    format: config.getLoggerFormat(),
    context: 'OUTBOX-${NAME^^}'
  });

  logger.info(`Outbox runner for ${NAME} starting (Lean Mode)...`);

  try {
    const db = await initDatabase(config);
    logger.info('Database connected successfully');

    // --- Main Loop ---
    const run = async () => {
       // Logic here
       setTimeout(run, 5000);
    };

    // run();

  } catch (error) {
    logger.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
};

bootstrap();
EOM

echo -e "${GREEN}✔ Outbox ${DIR_NAME} created successfully!${NC}"
echo -e "\nNext steps:"
echo -e "  1. cd ${DIR_NAME}"
echo -e "  2. yarn install"
echo -e "  3. Update config/default.config.json with correct port/db"
echo -e "  4. Start dev: yarn start:local\n"
