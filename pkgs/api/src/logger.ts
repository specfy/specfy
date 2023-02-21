import { pino } from 'pino';

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
      messageFormat: '{svc} \x1B[37m{msg}',
      translateTime: 'HH:MM',
      ignore: 'svc',
    },
  },
});
