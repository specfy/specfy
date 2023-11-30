import { envs } from '@specfy/core';
import { LogSnag } from 'logsnag';

import { dispatcher, type LogEvents } from '../client.js';

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

export const logsnag = new LogSnag({
  token: envs.LOGSNAG_KEY || '',
  project: 'specfy',
});

export function consume() {
  if (!envs.LOGSNAG_KEY) {
    return;
  }

  dispatcher.onAny(async (name, obj) => {
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
  });
}
