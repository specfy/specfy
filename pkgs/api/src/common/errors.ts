import type {
  ApiError,
  ResForbidden,
  ResNotFound,
  ResServerError,
  ResUnauthorized,
  ResValidationError,
} from '@specfy/core';
import type { FastifyReply } from 'fastify';
import type { ZodError } from 'zod';

export async function notFound(
  res: FastifyReply,
  message?: string
): Promise<void> {
  const err: ResNotFound = {
    error: {
      code: '404_not_found',
      reason: message,
    },
  };
  return res.status(404).send(err);
}

export async function unauthorized(res: FastifyReply): Promise<void> {
  const err: ResUnauthorized = {
    error: {
      code: '401_unauthorized',
    },
  };
  return res.status(401).send(err);
}

export async function forbidden(res: FastifyReply): Promise<void> {
  const err: ResForbidden = {
    error: {
      code: '403_forbidden',
    },
  };
  return res.status(403).send(err);
}

export async function serverError(res: FastifyReply): Promise<void> {
  const err: ResServerError = {
    error: {
      code: '500_server_error',
    },
  };
  return res.status(500).send(err);
}

export async function validationError(
  res: FastifyReply,
  data: ZodError
): Promise<void> {
  const fields: ResValidationError['error']['fields'] = {};
  const form: ResValidationError['error']['form'] = [];
  for (const issue of data.issues) {
    const fmt = {
      code:
        'params' in issue && issue.params.code ? issue.params.code : issue.code,
      message: issue.message,
      path: issue.path,
    };

    if (issue.path.length <= 0) {
      form.push(fmt);
      if (fmt.code === 'forbidden') {
        return forbidden(res);
      }
      continue;
    }

    fields[issue.path.join('.')] = fmt;
  }

  const err: ResValidationError = {
    error: {
      code: 'validation_error',
      form,
      fields,
    },
  };
  return res.status(400).send(err);
}

export class TransactionError<TErrors extends ApiError<string>> extends Error {
  err: ApiError<string>;

  constructor(err: TErrors) {
    super(err.error.code);

    this.err = err;
  }
}
