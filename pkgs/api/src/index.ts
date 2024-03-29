import { envs, isTest, l, sentry } from '@specfy/core';
import * as es from '@specfy/es';
import * as events from '@specfy/events';
import * as github from '@specfy/github';
import * as jobs from '@specfy/jobs';
import * as socket from '@specfy/socket';
import closeWithGrace from 'close-with-grace';
import Fastify from 'fastify';

import appService, { options } from './app.js';

// Require library to exit fastify process, gracefully (if possible)

// Instantiate Fastify with some config
const app = Fastify(options);

// Register your application as a normal plugin.
void app.register(appService);

process
  .on('unhandledRejection', (reason) => {
    sentry.captureException(reason);
    console.error('Unhandled Rejection at Promise', reason);
  })
  .on('uncaughtException', (err) => {
    sentry.captureException(err);
    console.error('Uncaught Exception thrown', err);
    process.exit(1);
  });

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace(
  { delay: 500 },
  async function ({ err }: any) {
    if (err) {
      app.log.error(err);
    }

    await app.close();
  }
);

app.addHook('onClose', async (_, done) => {
  try {
    closeListeners.uninstall();
    github.stop();
    await jobs.stop();
    socket.stop();
    events.stop();
  } catch (err) {
    console.error(err);
  }
  done();
});

// Start listening.
app.listen({ host: '0.0.0.0', port: parseInt(envs.PORT, 10) }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

void (async () => {
  l.info('Starting...');

  events.start();
  github.start();
  jobs.start();

  if (!isTest) {
    socket.start(app.server);
    await es.start();
  }
})();
