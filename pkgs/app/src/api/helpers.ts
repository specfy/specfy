import type {
  FieldsErrors,
  Res,
  ResErrors,
  ResValidationError,
} from '@specfy/core';

import { i18n } from '../common/i18n';
import type { useToast } from '../hooks/useToast';

export function isError<TType extends Res<{ Success: any }>['Reply']>(
  json: TType
): json is Exclude<TType, { data: any }> {
  return json && 'error' in (json as any);
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
