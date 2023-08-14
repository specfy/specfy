import path from 'node:path';
import { fileURLToPath } from 'node:url';

import envSchema from 'env-schema';

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

// TODO: use zod
const defs = {
  API_HOSTNAME: null,
  APP_HOSTNAME: null,
  COOKIE_SECRET: null,
  DATABASE_URL: null,
  DEFAULT_ACCOUNT: null,
  GITHUB_CLIENT_APPID: null,
  GITHUB_CLIENT_ID: null,
  GITHUB_CLIENT_PKEY: null,
  GITHUB_CLIENT_SECRET: null,
  GITHUB_WEBHOOKS_SECRET: null,
  GIVE_DEFAULT_PERMS_TO_EMAIL: null,
  NODE_ENV: 'dev',
  PASSWORD_SALT: null,
  PORT: '3000',
  RESEND_KEY: null,
  STRIPE_KEY: null,
  STRIPE_WEBHOOKS_SECRET: null,
};

type Key = keyof typeof defs;

export function env(key: Key, def?: string | null): string {
  if (!(key in process.env) && !def)
    throw new Error(`cant find "${key}" in process.env`);

  return process.env[key]! || def || '';
}

export const envs: Record<Key, string> = {} as any;

Object.entries(defs).forEach(([key, value]) => {
  envs[key as Key] = env(key as Key, value);
});

export const isProd = envs.NODE_ENV === 'production';
