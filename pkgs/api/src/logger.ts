import { sep } from 'node:path';
import { formatWithOptions } from 'node:util';

import * as c from 'colorette';
import type { LogLevel, LogType } from 'consola';
import { createConsola } from 'consola';
import { pino } from 'pino';

import { isProd } from './common/env.js';

export const TYPE_COLOR_MAP: { [k in LogType]?: keyof typeof c } = {
  info: 'cyan',
  fail: 'red',
  success: 'green',
  ready: 'green',
  start: 'magenta',
};
export const LEVEL_COLOR_MAP: { [k in LogLevel]?: keyof typeof c } = {
  0: 'red',
  1: 'yellow',
};

export function parseStack(stack: string) {
  const cwd = process.cwd() + sep;

  const lines = stack
    .split('\n')
    .splice(1)
    .map((l) => l.trim().replace('file://', '').replace(cwd, ''));

  return lines;
}

export const logger = pino({
  level: 'info',
  timestamp: true,
  base: {},
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  hooks: {
    // By default pino does Sprintf instead we merge objects.
    logMethod(args, method) {
      const final: Record<string, any> = { msg: '', data: {} };

      args.reverse().forEach((m) => {
        if (typeof m === 'string') {
          final.msg += m;
        } else if (typeof m === 'object' && m instanceof Error) {
          final.err = m;
        } else if (!m) {
          final.msg = m;
        } else if (m.err || m.error) {
          final.err = m.err || m.error;
        } else if (m.req) {
          final.msg = `#${m.req.id} <- ${m.req.method} ${m.req.url}`;
        } else if (m.res) {
          final.msg = `#${m.res.request.id} -> ${m.res.statusCode}`;
        } else {
          final.data = { ...final.data, ...m };
        }
      });
      method.apply(this, [final as unknown as string]);
    },
  },
  // prettifier: !isProd,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      messageFormat: '[{svc}] \x1B[37m{msg}',
      translateTime: 'HH:MM',
      ignore: 'svc',
    },
  },
});

function formatStack(stack: string) {
  return parseStack(stack)
    .map(
      (line) =>
        '  ' +
        line
          .replace(/^at +/, (m) => c.gray(m))
          .replace(/\((.+)\)/, (_, m) => `(${c.cyan(m)})`)
    )
    .join('\n');
}

export const l = createConsola({
  reporters: isProd
    ? [
        {
          log: (logObj) => {
            console.log(JSON.stringify(logObj));
          },
        },
      ]
    : [
        {
          log: (obj) => {
            const typeColor: keyof typeof c =
              TYPE_COLOR_MAP[obj.type] || LEVEL_COLOR_MAP[obj.level] || 'gray';

            let line = '';
            if (obj.args.length > 0) {
              // Render errors first
              const args = obj.args.map((arg) => {
                if (arg && typeof arg.stack === 'string') {
                  return arg.message + '\n' + formatStack(arg.stack);
                }
                return arg;
              });

              if (typeof args[0] === 'string') {
                // Try to format on the same line if possible
                line = formatWithOptions({ colors: true }, ...args);
              } else {
                // Print object on a different line for readability
                line = `\n${formatWithOptions({ colors: true }, ...args)}`;
              }
            }
            if (obj.type === 'trace') {
              const _err = new Error('Trace: ' + obj.message);
              line += formatStack(_err.stack || '');
            }

            console.log(
              obj.tag && c.blue(`[${obj.tag}]`),
              // @ts-expect-error
              // eslint-disable-next-line import/namespace
              c[typeColor as any](obj.type),
              line
            );
          },
        },
      ],
});
