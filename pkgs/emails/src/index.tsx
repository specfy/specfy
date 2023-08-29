import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend/build/src/emails/interfaces';

import type { InvitationProps } from './emails/invitation.js';
import { Invitation } from './emails/invitation.js';
import type { WelcomeProps } from './emails/welcome.js';
import { Welcome } from './emails/welcome.js';

export function getResend(key: string) {
  return new Resend(key);
}

export async function sendWelcome(
  resend: Resend,
  data: Omit<CreateEmailOptions, 'text' | 'from' | 'subject'>,
  props: WelcomeProps
) {
  await resend.sendEmail({
    ...data,
    from: 'Specfy <support@specfy.io>',
    subject: 'Welcome to Specfy',
    react: <Welcome {...props} />,
  });
}

export async function sendInvitation(
  resend: Resend,
  data: Omit<CreateEmailOptions, 'text' | 'from' | 'subject'>,
  props: InvitationProps
) {
  await resend.sendEmail({
    ...data,
    from: 'Specfy <support@specfy.io>',
    subject: `Join ${props.org.name} on Specfy`,
    react: <Invitation {...props} />,
  });
}
