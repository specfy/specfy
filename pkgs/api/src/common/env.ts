import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Keys =
  | 'API_HOSTNAME'
  | 'APP_HOSTNAME'
  | 'COOKIE_SECRET'
  | 'DATABASE_URL'
  | 'DEFAULT_ACCOUNT'
  | 'ENVIRONMENT'
  | 'GITHUB_CLIENT_APPID'
  | 'GITHUB_CLIENT_ID'
  | 'GITHUB_CLIENT_PKEY'
  | 'GITHUB_CLIENT_SECRET'
  | 'GITHUB_WEBHOOKS_SECRET'
  | 'GIVE_DEFAULT_PERMS_TO_EMAIL'
  | 'NODE_ENV'
  | 'PASSWORD_SALT'
  | 'PORT';

export function env(key: Keys): string | undefined;
export function env(key: Keys, def: string): string;
export function env(key: Keys, def?: string): string | undefined {
  if (!(key in process.env) && !def)
    throw new Error(`cant find "${key}" in process.env`);

  return process.env[key] || def;
}

export const isProd = env('NODE_ENV', 'dev') === 'production';

export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);
