export interface Pagination {
  currentPage: number;
  totalItems: number;
}

export interface ValidationError {
  code: string;
  // expected: string | null;
  path: Array<number | string>;
  message: string;
}

export type FieldsErrors = Record<string, ValidationError>;

export interface ResValidationError {
  error: {
    code: 'validation_error';
    fields: FieldsErrors;
    form: ValidationError[];
  };
}

export interface ResNotFound {
  error: {
    code: '404_not_found';
    message?: string | undefined;
  };
}

export interface ResForbidden {
  error: {
    code: '403_forbidden';
  };
}

export interface ResUnauthorized {
  error: {
    code: '401_unauthorized';
  };
}

export interface ResServerError {
  error: {
    code: '500_server_error';
  };
}

export type ResErrors =
  | ResForbidden
  | ResNotFound
  | ResUnauthorized
  | ResValidationError;
