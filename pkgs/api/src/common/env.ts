type Keys = 'DATABASE_URL' | 'ENVIRONMENT';

export function env(key: Keys): string | undefined;
export function env(key: Keys, def: string): string;
export function env(key: Keys, def?: string): string | undefined {
  return process.env[key] || def;
}
