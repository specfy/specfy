import { getResend } from '@specfy/emails';

import { envs } from './env.js';

export const resend = getResend(envs.RESEND_KEY);
