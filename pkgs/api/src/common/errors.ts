import type { FastifyReply } from 'fastify';
import type { ZodError } from 'zod';

import type {
  ResForbidden,
  ResNotFound,
  ResServerError,
  ResUnauthorized,
  ResValidationError,
} from '../types/api/index.js';

export function notFound(res: FastifyReply, message?: string): void {
  const err: ResNotFound = {
    error: {
      code: '404_not_found',
      message,
    },
  };
  res.status(404).send(err);
}

export function unauthorized(res: FastifyReply): void {
  const err: ResUnauthorized = {
    error: {
      code: '401_unauthorized',
    },
  };
  res.status(401).send(err);
}

export function forbidden(res: FastifyReply): void {
  const err: ResForbidden = {
    error: {
      code: '403_forbidden',
    },
  };
  res.status(403).send(err);
}

export function serverError(res: FastifyReply): void {
  const err: ResServerError = {
    error: {
      code: '500_server_error',
    },
  };
  res.status(500).send(err);
}

export function validationError(res: FastifyReply, data: ZodError): void {
  const fields: ResValidationError['error']['fields'] = {};
  const form: ResValidationError['error']['form'] = [];
  for (const issue of data.issues) {
    const fmt = {
      code:
        'params' in issue && issue.params.code ? issue.params.code : issue.code,
      message: issue.message,
      path: issue.path,
      // expected: 'expected' in issue ? (issue.expected as string) : null,
    };

    if (issue.path.length <= 0) {
      form.push(fmt);
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
  res.status(400).send(err);
}

export class TransactionError extends Error {}
