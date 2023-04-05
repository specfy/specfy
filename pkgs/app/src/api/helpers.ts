import type { ResErrors } from 'api/src/types/api';

export function isError(res: unknown): res is ResErrors {
  return typeof res === 'object' && res !== null && 'error' in res;
}
