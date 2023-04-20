import type { Authenticator } from '@fastify/passport';
import { Strategy as GithubStrategy } from 'passport-github2';

import { env } from '../../common/env';
import { nanoid } from '../../common/id';
import { prisma } from '../../db';
import type { GithubAuth } from '../../types/github';

const GITHUB_SCOPES = ['user:email'];

export function registerGithub(passport: Authenticator) {
  const reg = new GithubStrategy(
    {
      clientID: env('GITHUB_CLIENT_ID')!,
      clientSecret: env('GITHUB_CLIENT_SECRET')!,
      callbackURL: 'http://127.0.0.1:3000/0/oauth/github/cb',
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

      user = await prisma.users.create({
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

      done(null, user);
    }
  );
  passport.use('github', reg);
}
