import { dispatcher, eventLogger } from './client.js';
import * as emails from './emails/index.js';
import * as hubspot from './hubspot/index.js';
import * as logsnag from './logsnag/index.js';
export * from './client.js';

export function start() {
  eventLogger.info('Event service starting');
  emails.consume();
  hubspot.consume();
  logsnag.consume();
}

export function stop() {
  eventLogger.info('Event service stopping');
  dispatcher.emitter.removeAllListeners();
}
