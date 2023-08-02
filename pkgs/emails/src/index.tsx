import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend/build/src/emails/interfaces';

import type { InvitationProps } from '../emails/invitation';
import { Invitation } from '../emails/invitation';
import type { WelcomeProps } from '../emails/welcome';
import { Welcome } from '../emails/welcome';

export function getResend(key: string) {
  return new Resend(key);
}

export async function sendWelcome(
  resend: Resend,
  data: Omit<CreateEmailOptions, 'text'>,
  props: WelcomeProps
) {
  await resend.sendEmail({
    ...data,
    react: <Welcome {...props} />,
  });
}

export async function sendInvitation(
  resend: Resend,
  data: Omit<CreateEmailOptions, 'text'>,
  props: InvitationProps
) {
  await resend.sendEmail({
    ...data,
    react: <Invitation {...props} />,
  });
}
