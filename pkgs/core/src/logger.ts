import { sep } from 'node:path';

import type { Level, LoggerOptions } from 'pino';
import { pino } from 'pino';

import { isProd } from './env.js';
import { metrics } from './metric.js';

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
const levelToSeverity: Record<string, string> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

export function parseStack(stack: string) {
  const cwd = process.cwd() + sep;

  const lines = stack
    .split('\n')
    .splice(1)
    .map((l) => l.trim().replace('file://', '').replace(cwd, ''));

  return lines;
}

export const options: LoggerOptions = {
  level: 'info',
  timestamp: true,
  base: {
    serviceContext: { service: 'specfy' },
  },
  formatters: isProd
    ? {
        level(label) {
          const pinoLevel = label as Level;
          const severity = levelToSeverity[label] ?? 'INFO';
          // `@type` property tells Error Reporting to track even if there is no `stack_trace`
          // you might want to make this an option the plugin, in our case we do want error reporting for all errors, with or without a stack
          const typeProp =
            pinoLevel === 'error' || pinoLevel === 'fatal'
              ? {
                  '@type':
                    'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent',
                }
              : {};
          return { severity, ...typeProp };
        },
      }
    : {
        level(label) {
          return { level: label };
        },
      },
  hooks: {
    // By default pino does Sprintf instead we merge objects.
    logMethod(args, method) {
      const final: Record<string, any> = { message: '', data: {} };

      args.reverse().forEach((m) => {
        if (typeof m === 'string') {
          final.message += m;
        } else if (typeof m === 'object' && m instanceof Error) {
          final.err = m;
          final.stack_trace = m.stack;
        } else if (!m) {
          final.message = m;
        } else if (m.err || m.error) {
          final.err = m.err || m.error;
        } else if (m.req) {
          final.message = `#${m.req.id} <- ${m.req.method} ${m.req.url}`;
        } else if (m.res) {
          final.message = `#${m.res.request.id} -> ${m.res.statusCode}`;
        } else {
          final.data = { ...final.data, ...m };
        }
      });
      method.apply(this, [final as unknown as string]);
    },
  },
  messageKey: 'message',
};

if (!isProd) {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      messageFormat: '[{svc}] \x1B[37m{message}',
      translateTime: 'HH:MM',
      ignore: 'svc,serviceContext,message',
    },
  };
}

export const l = pino(options);
export type Logger = typeof l;

export function createFileLogger(
  bindings: pino.Bindings,
  dest: string
): Logger {
  return pino({
    ...options,
    base: {
      ...options.base,
      ...bindings,
    },
    transport: {
      level: 'info',
      target: 'pino/file',
      options: { destination: dest },
    },
  });
}

const eventLogger = l.child({ svc: 'event' });
export function logEvent(name: string, obj?: any) {
  if (process.env.VITEST) {
    return;
  }

  eventLogger.info(obj, name);
  metrics.increment('github.link');
}
// function formatStack(stack: string) {
//   return parseStack(stack)
//     .map(
//       (line) =>
//         '  ' +
//         line
//           .replace(/^at +/, (m) => c.gray(m))
//           .replace(/\((.+)\)/, (_, m) => `(${c.cyan(m)})`)
//     )
//     .join('\n');
// }
