import { nanoid, l, envs, logEvent, isTest } from '@specfy/core';
import { prisma } from '@specfy/db';
import { sendWelcome } from '@specfy/emails';
import { createUserActivity } from '@specfy/models';
import { Strategy as GitHubStrategy } from 'passport-github2';

import type { Users } from '@specfy/db';

import { resend } from '../../common/emails.js';

import { AuthError } from './errors.js';

import type { GitHubAuth } from '../../types/github.js';
import type { Authenticator } from '@fastify/passport';

const GITHUB_SCOPES = ['user:email', 'repo'];

export function registerGitHub(passport: Authenticator) {
  // @ts-expect-error
  const reg = new GitHubStrategy(
    {
      clientID: envs.GITHUB_CLIENT_ID!,
      clientSecret: envs.GITHUB_CLIENT_SECRET,
      callbackURL: `${envs.API_HOSTNAME}/0/auth/github/cb`,
      scope: GITHUB_SCOPES,
      passReqToCallback: true,
      allRawEmails: true,
    },
    async function (
      _req: unknown,
      accessToken: string,
      _refreshToken: string,
      profile: GitHubAuth,
      done: (err: Error | null, user?: Users | null) => void
    ) {
      const emails = profile.emails;
      if (!emails || emails.length < 0) {
        done(new AuthError('email', 'no_email', 'Account has no valid email'));
        return;
      }

      const email = emails.find((e) => {
        return e.primary === true && e.verified;
      });
      if (!email) {
        done(new AuthError('email', 'no_email', 'Account has no valid email'));
        return;
      }

      const primary = email.value;
      const secondaries = emails.filter((e) => e.verified).map((e) => e.value);
      const avatarUrl = profile.photos?.[0].value || null;

      console.log(emails, secondaries);

      let user = await prisma.users.findUnique({
        where: { email: primary },
      });

      const displayName = profile.displayName || profile.username;
      // We found the user
      if (user) {
        await prisma.users.update({
          data: { avatarUrl, githubLogin: profile.username, name: displayName },
          where: { id: user.id },
        });
        await prisma.accounts.updateMany({
          data: {
            accessToken,
            providerAccountId: profile.id,
            scope: GITHUB_SCOPES.join(','),
            emails: secondaries,
          },
          where: { userId: user.id, provider: 'github' },
        });

        logEvent('account.login', { userId: user.id });

        done(null, user);
        return;
      }

      // New user
      await prisma.$transaction(async (tx) => {
        user = await tx.users.create({
          data: {
            id: nanoid(),
            name: displayName,
            email: primary,
            emailVerifiedAt: new Date(),
            avatarUrl,
            githubLogin: profile.username,
            Accounts: {
              create: {
                id: nanoid(),
                type: 'oauth',
                provider: 'github',
                providerAccountId: profile.id,
                scope: GITHUB_SCOPES.join(','),
                accessToken: accessToken,
                emails: secondaries,
              },
            },
          },
        });

        await createUserActivity({
          user,
          action: 'User.created',
          target: user,
          orgId: null,
          tx,
        });
      });

      logEvent('account.register', { userId: user!.id });

      if (!isTest) {
        l.info('Sending email', { to: email, type: 'welcome' });
        await sendWelcome(
          resend,
          {
            to: primary,
          },
          { email: primary, name: displayName }
        );
      }

      done(null, user);
    }
  );

  passport.use('github', reg);
}
