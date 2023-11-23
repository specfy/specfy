import path from 'node:path';
import { fileURLToPath } from 'node:url';

import envSchema from 'env-schema';
import { z } from 'zod';

export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(path.join(filename, '..'));

export const config = envSchema({
  schema: {
    type: 'object',
  },
  dotenv: {
    path: path.join(dirname, '../../.env'),
  },
});

const schema = z.object({
  API_HOSTNAME: z.string().min(1),
  APP_HOSTNAME: z.string().min(1),
  COOKIE_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DD_API_KEY: z.string().optional(),
  DEFAULT_ACCOUNT: z.string().optional(),
  ELASTICSEARCH_HOST: z.string(),
  ELASTICSEARCH_USER: z.string(),
  ELASTICSEARCH_PWD: z.string(),
  GITHUB_CLIENT_APPID: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_PKEY: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_WEBHOOKS_SECRET: z.string().min(1),
  GIVE_DEFAULT_PERMS_TO_EMAIL: z.string().optional(),
  JWT_SECRET: z.string().min(1),
  NODE_ENV: z
    .enum(['production', 'development', 'test'])
    .default('development'),
  OPENAI_KEY: z.string().optional(),
  PASSWORD_SALT: z.string().min(1),
  PORT: z.string().default('3000'),
  RESEND_KEY: z.string().optional(),
  STRIPE_KEY: z.string().optional(),
  STRIPE_WEBHOOKS_SECRET: z.string().optional(),
  LOGSNAG_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

export const envs = schema.parse(process.env);

export const isProd = envs.NODE_ENV === 'production';
export const isTest = Boolean(process.env.VITEST);
