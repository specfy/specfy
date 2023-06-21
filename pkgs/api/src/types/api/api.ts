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

export type Res<
  T extends {
    Params?: Record<string, any>;
    Body?: Record<string, any>;
    Querystring?: Record<string, any>;
    Success: Record<string, any> | never;
  }
> = {
  Params: T['Params'] extends Record<string, any> ? T['Params'] : never;
  Success: T['Success'];
  Reply: ResErrors | T['Success'];
  Body: T['Body'] extends Record<string, any> ? T['Body'] : never;
  Querystring: T['Querystring'] extends Record<string, any>
    ? T['Querystring']
    : never;
  // Querystring + Params
  QP: (T['Params'] extends Record<string, any> ? T['Params'] : never) &
    (T['Querystring'] extends Record<string, any> ? T['Querystring'] : never);
};

export interface QuerystringOrgProject {
  org_id: string;
  project_id: string;
}
