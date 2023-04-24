import type { Authenticator } from '@fastify/passport';
import { Strategy as GithubStrategy } from 'passport-github2';

import { env } from '../../common/env';
import { nanoid } from '../../common/id';
import { slugify } from '../../common/string';
import { prisma } from '../../db';
import { createOrg } from '../../models';
import type { GithubAuth } from '../../types/github';

const GITHUB_SCOPES = ['user:email'];

export function registerGithub(passport: Authenticator) {
  const reg = new GithubStrategy(
    {
      clientID: env('GITHUB_CLIENT_ID')!,
      clientSecret: env('GITHUB_CLIENT_SECRET')!,
      callbackURL: `${env('API_HOSTNAME')}/0/auth/github/cb`,
      scope: GITHUB_SCOPES,
      passReqToCallback: true,
    },
    async function (
      _req: any,
      accessToken: string,
      _refreshToken: string,
      profile: GithubAuth,
      done: any
    ) {
      const emails = profile.emails;
      if (!emails || emails.length < 0) {
        done('no_email');
        return;
      }

      const email = emails[0].value;

      let user = await prisma.users.findUnique({
        where: { email },
      });
      if (user) {
        done(null, user);
        return;
      }

      await prisma.$transaction(async (tx) => {
        user = await tx.users.create({
          data: {
            id: nanoid(),
            name: profile.displayName,
            email,
            emailVerifiedAt: new Date(),
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

        await createOrg(tx, user, {
          id: slugify(`${profile.displayName} ${nanoid().substring(0, 5)}`),
          name: `${profile.displayName} org`,
        });
      });

      done(null, user);
    }
  );

  passport.use('github', reg);
}
