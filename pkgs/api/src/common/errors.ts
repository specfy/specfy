import type { FastifyReply } from 'fastify';
import type { ZodError } from 'zod';

import type {
  ResForbidden,
  ResNotFound,
  ResValidationError,
} from '../types/api';

export function notFound(res: FastifyReply): void {
  const err: ResNotFound = {
    error: {
      code: '404_not_found',
    },
  };
  res.status(404).send(err);
}

export function forbidden(res: FastifyReply): void {
  const err: ResForbidden = {
    error: {
      code: '403_forbidden',
    },
  };
  res.status(403).send(err);
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
