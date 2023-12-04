import { isTest, l, metrics, sentry } from '@specfy/core';
import EventEmitter from 'eventemitter2';

import type { Invitations, Orgs, Users } from '@specfy/db';

export type LogEvents = {
  'account.deleted': { userId: string; email: string };
  'account.login': { userId: string };
  'account.register': { userId: string; user: Users; github: any };

  'github.link_org': { userId: string; orgId: string };
  'github.unlink_org': { userId: string; orgId: string };
  'github.link_project': { userId: string; orgId: string; projectId: string };
  'github.unlink_project': { userId: string; orgId: string; projectId: string };

  'invitation.accepted': { userId: string; orgId: string };
  'invitation.created': {
    userId: string;
    orgId: string;
    org: Orgs;
    from: Users;
    invite: Invitations;
  };

  'jobs.created': {
    userId: string;
    orgId: string;
    projectId: string;
    type: 'deploy' | 'projectIndex';
  };

  'orgs.created': { userId: string; orgId: string };
  'orgs.deleted': { userId: string; orgId: string };

  'projects.created': { userId: string; orgId: string; projectId: string };
  'projects.deleted': { userId: string; orgId: string; projectId: string };

  'stripe.cancel': { userId: string; orgId: string };
  'stripe.deleted': { orgId: string };
  'stripe.subscribed': { orgId: string };
  'stripe.updated': { userId: string; orgId: string };
};

export const eventLogger = l.child({ svc: 'event' });

class Dispatcher {
  emitter;

  constructor() {
    this.emitter = new EventEmitter({ wildcard: true });
  }

  async emit<TKey extends keyof LogEvents>(name: TKey, obj: LogEvents[TKey]) {
    try {
      await this.emitter.emitAsync(name, obj);
    } catch (err) {
      console.error('Error during event processing', err);
      sentry.captureException(err);
    }
  }

  onAny(
    cb: <TKey extends keyof LogEvents>(name: TKey, obj: LogEvents[TKey]) => void
  ) {
    this.emitter.onAny(cb as any);
  }

  on<TKey extends keyof LogEvents>(
    name: TKey,
    cb: (obj: LogEvents[TKey]) => void
  ) {
    this.emitter.on(name, cb, { async: true, promisify: true });
  }
}

export const dispatcher = new Dispatcher();

/**
 * Log specific event.
 */
export async function logEvent<TKey extends keyof LogEvents>(
  name: TKey,
  obj: LogEvents[TKey]
) {
  if (isTest) {
    return;
  }

  try {
    // Remove object from the log to avoid leaking secrets or logging useless info
    // Ideally it could be better to have an allowlist or denylist
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'object') {
        continue;
      }
      clean[k] = v;
    }
    eventLogger.info(clean, name);

    // Log to datadog
    metrics.increment(name);

    // Dispatch the event for further consumption
    dispatcher.emit(name, obj);
  } catch (e) {
    console.log('Error during logEvent', e);
  }
}
