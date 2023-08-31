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
    path: '../../.env',
  },
});

const schema = z.object({
  API_HOSTNAME: z.string().nonempty(),
  APP_HOSTNAME: z.string().nonempty(),
  COOKIE_SECRET: z.string().nonempty(),
  DATABASE_URL: z.string().nonempty(),
  DD_API_KEY: z.string().optional(),
  DEFAULT_ACCOUNT: z.string().optional(),
  GITHUB_CLIENT_APPID: z.string().nonempty(),
  GITHUB_CLIENT_ID: z.string().nonempty(),
  GITHUB_CLIENT_PKEY: z.string().nonempty(),
  GITHUB_CLIENT_SECRET: z.string().nonempty(),
  GITHUB_WEBHOOKS_SECRET: z.string().nonempty(),
  GIVE_DEFAULT_PERMS_TO_EMAIL: z.string().optional(),
  JWT_SECRET: z.string().nonempty(),
  NODE_ENV: z
    .enum(['production', 'development', 'test'])
    .default('development'),
  OPENAI_KEY: z.string().optional(),
  PASSWORD_SALT: z.string().nonempty(),
  PORT: z.string().default('3000'),
  RESEND_KEY: z.string().optional(),
  STRIPE_KEY: z.string().optional(),
  STRIPE_WEBHOOKS_SECRET: z.string().nonempty(),
});

export const envs = schema.parse(process.env);

export const isProd = envs.NODE_ENV === 'production';
