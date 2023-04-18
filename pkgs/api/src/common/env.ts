type Keys =
  | 'DATABASE_URL'
  | 'DEFAULT_ACCOUNT'
  | 'ENVIRONMENT'
  | 'NODE_ENV'
  | 'PORT';

export function env(key: Keys): string | undefined;
export function env(key: Keys, def: string): string;
export function env(key: Keys, def?: string): string | undefined {
  return process.env[key] || def;
}
