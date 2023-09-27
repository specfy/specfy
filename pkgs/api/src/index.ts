import { envs, isTest } from '@specfy/core';
import { start, stop } from '@specfy/github';
import { initSocket } from '@specfy/socket';
import closeWithGrace from 'close-with-grace';
import Fastify from 'fastify';

import appService, { options } from './app.js';

// Require library to exit fastify process, gracefully (if possible)

// Instantiate Fastify with some config
const app = Fastify(options);

// Register your application as a normal plugin.
void app.register(appService);

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
  closeListeners.uninstall();
  await stop();
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
  await start();

  if (!isTest) {
    initSocket(app.server);
  }
})();
