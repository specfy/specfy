import { envs } from '@specfy/core';
import { getResend } from '@specfy/emails';

export const resend = getResend(envs.RESEND_KEY);
