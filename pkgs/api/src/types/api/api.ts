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

export type FieldsErrors = Record<string, ValidationError | undefined>;

export type ApiError<TCode extends string> = {
  error: {
    code: TCode;
    reason?: string | undefined;
  };
};

export interface ResValidationError {
  error: {
    code: 'validation_error';
    fields: FieldsErrors;
    form: ValidationError[];
  };
}

export type ResNotFound = ApiError<'404_not_found'>;
export type ResForbidden = ApiError<'403_forbidden'>;
export type ResUnauthorized = ApiError<'401_unauthorized'>;
export type ResServerError = ApiError<'500_server_error'>;

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
    Error?: ApiError<any> | never;
    Success: Record<string, any> | never;
  },
> = {
  Params: T['Params'] extends Record<string, any> ? T['Params'] : never;
  Success: T['Success'];
  Reply:
    | ResErrors
    | (T['Error'] extends ApiError<any>
        ? T['Error'] | T['Success']
        : T['Success']);
  Body: T['Body'] extends Record<string, any> ? T['Body'] : never;
  Querystring: T['Querystring'] extends Record<string, any>
    ? T['Querystring']
    : never;
  // Querystring + Params
  QP: (T['Params'] extends Record<string, any> ? T['Params'] : never) &
    (T['Querystring'] extends Record<string, any> ? T['Querystring'] : never);
};

export interface QuerystringOrgMaybeProject {
  org_id: string;
  project_id?: string;
}
export interface QuerystringOrgProject {
  org_id: string;
  project_id: string;
}
