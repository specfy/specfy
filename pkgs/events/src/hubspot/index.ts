import { envs, l, sentry } from '@specfy/core';

import { dispatcher } from '../client.js';

import {
  createCRMContact,
  deleteCRMContact,
  subscribeToEmails,
} from './helpers.js';

export function consume() {
  dispatcher.on('account.register', async ({ user, github }) => {
    if (!envs.HUBSPOT_ACCESS_TOKEN) {
      return;
    }

    try {
      l.info('Creating contact in CRM');

      await createCRMContact({
        firstname: user.name,
        email: user.email,
        githubProfile: github,
      });
      await subscribeToEmails(user.email);

      l.info('CRM contact created');
    } catch (error) {
      l.error(error instanceof Error ? error.message : error);
      sentry.captureException(error);
    }
  });

  dispatcher.on('account.deleted', async (obj) => {
    if (!envs.HUBSPOT_ACCESS_TOKEN) {
      return;
    }

    try {
      l.info('Deleting contact in CRM');
      await deleteCRMContact(obj.email);
      l.info('CRM contact deleted');
    } catch (error) {
      l.error(error instanceof Error ? error.message : error);
      sentry.captureException(error);
    }
  });
}
