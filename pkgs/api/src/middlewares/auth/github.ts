import type { Authenticator } from '@fastify/passport';
import { nanoid, l, envs, logEvent } from '@specfy/core';
import type { Users } from '@specfy/db';
import { prisma } from '@specfy/db';
import { sendWelcome } from '@specfy/emails';
import { createUserActivity } from '@specfy/models';
import { Strategy as GitHubStrategy } from 'passport-github2';

import { resend } from '../../common/emails.js';
import type { GitHubAuth } from '../../types/github.js';

import { AuthError } from './errors.js';

const GITHUB_SCOPES = ['user:email', 'repo'];

export function registerGitHub(passport: Authenticator) {
  const reg = new GitHubStrategy(
    {
      clientID: envs.GITHUB_CLIENT_ID!,
      clientSecret: envs.GITHUB_CLIENT_SECRET,
      callbackURL: `${envs.API_HOSTNAME}/0/auth/github/cb`,
      scope: GITHUB_SCOPES,
      passReqToCallback: true,
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

      const email = emails[0].value;
      const avatarUrl = profile.photos?.[0].value || null;

      let user = await prisma.users.findUnique({
        where: { email },
      });

      const displayName = profile.displayName || profile.username;
      // We found the user
      if (user) {
        if (
          user.avatarUrl !== avatarUrl ||
          user.githubLogin !== profile.username ||
          displayName !== profile.displayName
        ) {
          await prisma.users.update({
            data: {
              avatarUrl,
              githubLogin: profile.username,
              name: displayName,
            },
            where: { id: user.id },
          });
        }
        await prisma.accounts.updateMany({
          data: {
            accessToken,
            providerAccountId: profile.id,
            scope: GITHUB_SCOPES.join(','),
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
            email,
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

      if (!process.env.VITEST) {
        l.info('Sending email', { to: email, type: 'welcome' });
        await sendWelcome(
          resend,
          {
            to: email,
          },
          { email, name: displayName }
        );
      }

      done(null, user);
    }
  );

  passport.use('github', reg);
}
