import type {
  FieldsErrors,
  ResErrors,
  ResValidationError,
} from '@specfy/api/src/types/api';

import { i18n } from '../common/i18n';
import type { useToast } from '../hooks/useToast';

export function isError(res: unknown): res is ResErrors {
  return typeof res === 'object' && res !== null && 'error' in res;
}
export function isValidationError(res: ResErrors): res is ResValidationError {
  return res.error.code === 'validation_error';
}

export function handleErrors(
  res: ResErrors,
  toast: ReturnType<typeof useToast>,
  setErrors: React.Dispatch<React.SetStateAction<FieldsErrors>>
): void {
  if (isValidationError(res)) {
    setErrors(res.error.fields);
  } else {
    toast.add({ title: i18n.errorOccurred, status: 'error' });
  }
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
