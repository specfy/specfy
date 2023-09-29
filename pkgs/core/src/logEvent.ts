import { LogSnag } from 'logsnag';

import { envs, isTest } from './env.js';
import { l } from './logger.js';
import { metrics } from './metric.js';

export const logsnag = new LogSnag({
  token: envs.LOGSNAG_KEY || '',
  project: 'specfy',
});

const eventLogger = l.child({ svc: 'event' });

type LogEvents = {
  'account.deleted': { userId: string };
  'account.login': { userId: string };
  'account.register': { userId: string };
  'github.link_org': { userId: string; orgId: string };
  'github.unlink_org': { userId: string; orgId: string };
  'github.link_project': { userId: string; orgId: string; projectId: string };
  'github.unlink_project': { userId: string; orgId: string; projectId: string };
  'invitation.accepted': { userId: string; orgId: string };
  'invitation.created': { userId: string; orgId: string };
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

const nameToReadable: Record<keyof LogEvents, { icon: string; event: string }> =
  {
    'account.deleted': { icon: '😥', event: 'User deleted' },
    'account.login': { icon: '👋🏻', event: 'User Login' },
    'account.register': { icon: '🥳', event: 'User registered' },
    'github.link_org': { icon: '🔗', event: 'Github Org Link' },
    'github.unlink_org': { icon: '🥶', event: 'Github Org Unlink' },
    'github.link_project': { icon: '🔗', event: 'Github Project Link' },
    'github.unlink_project': { icon: '☹️', event: 'Github Project Unlink' },
    'invitation.accepted': { icon: '✨', event: 'Invitation Accepted' },
    'invitation.created': { icon: '📣', event: 'Invitation Created' },
    'jobs.created': { icon: '🚢', event: 'Job Created' },
    'orgs.created': { icon: '🚀', event: 'Org Created' },
    'orgs.deleted': { icon: '😭', event: 'Org Deleted' },
    'projects.created': { icon: '🎉', event: 'Project Created' },
    'projects.deleted': { icon: '🙁', event: 'Project Deleted' },
    'stripe.cancel': { icon: '📉', event: 'Subscription Cancelled' },
    'stripe.deleted': { icon: '📉', event: 'Subscription Deleted' },
    'stripe.subscribed': { icon: '💸', event: 'Subscription Created' },
    'stripe.updated': { icon: '📊', event: 'Subscription Updated' },
  };

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
    eventLogger.info(obj, name);
    metrics.increment(name);

    if (envs.LOGSNAG_KEY) {
      const userId = 'userId' in obj ? obj.userId : '';
      const tags: Record<string, string> = {};
      for (const [key, string] of Object.entries(obj)) {
        if (key === 'userId') {
          continue;
        }
        tags[key.toLocaleLowerCase()] = string;
      }

      // Can throw errors
      await logsnag.track({
        channel: name.split('.')[0],
        ...nameToReadable[name],
        user_id: userId,
        tags,
      });
    }
  } catch (e) {
    console.log('Error during logEvent', e);
  }
}
