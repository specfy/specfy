import { envs, isTest, l } from '@specfy/core';
import { getResend, sendInvitation, sendWelcome } from '@specfy/emails';

import { dispatcher } from '../client.js';

export const resend = getResend(envs.RESEND_KEY || 'please_change_that_resend');

export function consume() {
  if (isTest || !envs.RESEND_KEY) {
    // we don't want to send emails during test suites
    return;
  }

  dispatcher.on('account.register', async ({ user }) => {
    l.info('Sending email', { to: user.email, type: 'welcome' });
    await sendWelcome(
      resend,
      {
        to: user.email,
      },
      { email: user.email, name: user.name }
    );
  });

  dispatcher.on('invitation.created', async (obj) => {
    const invite = obj.invite;

    const link = `${envs.APP_HOSTNAME}/invite?invitation_id=${invite.id}&token=${invite.token}`;
    l.info('Sending email', { to: invite.email, type: 'invitation' });

    await sendInvitation(
      resend,
      {
        to: invite.email,
      },
      {
        email: invite.email,
        invitedBy: obj.from,
        inviteLink: link,
        org: obj.org,
      }
    );
  });
}
