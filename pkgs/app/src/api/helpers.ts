import type { ResErrors, ResValidationError } from '@specfy/api/src/types/api';

export function isError(res: unknown): res is ResErrors {
  return typeof res === 'object' && res !== null && 'error' in res;
}
export function isValidationError(res: ResErrors): res is ResValidationError {
  return res.error.code === 'validation_error';
}

export class APIError extends Error {
  details;
  constructor(details: {
    res: Response;
    json: Record<string, any> | ResErrors;
  }) {
    super('err');
    this.details = details;
  }
}
