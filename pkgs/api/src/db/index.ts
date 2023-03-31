import { Sequelize } from 'sequelize-typescript';

import { env } from '../common/env';
import { logger } from '../logger';
import * as models from '../models';

const isProduction = env('ENVIRONMENT') === 'production';
const isSSLDisabled = 'disable';
const poolMax = 5;
const poolMin = 0;
const url = env(
  'DATABASE_URL',
  'postgres://postgres:postgres@localhost:5432/postgres'
);

export const db = new Sequelize(url, {
  logging: (sql) => {
    if (env('NODE_ENV') !== 'test') {
      logger.info(sql);
    }
  },
  dialectOptions: {
    ssl:
      isProduction && !isSSLDisabled
        ? {
            // Ref.: https://github.com/brianc/node-postgres/issues/2009
            rejectUnauthorized: false,
          }
        : false,
  },
  models: Object.values(models),
  pool: {
    max: poolMax,
    min: poolMin,
    acquire: 30000,
    idle: 10000,
  },
});
