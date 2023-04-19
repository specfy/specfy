import fs from 'fs';
import path from 'path';

import { Authenticator } from '@fastify/passport';
import fastifySession from '@fastify/secure-session';
import type { Users } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import type { JWT } from '../common/auth';
import { JWT_SECRET } from '../common/auth';
import { env } from '../common/env';
import { unauthorized } from '../common/errors';
import { nanoid } from '../common/id';
import { prisma } from '../db';
import type { GithubAuth } from '../types/github';

const GITHUB_SCOPES = ['user:email'];
const ALLOW_GUEST = ['/', '/0/oauth/github', '/0/oauth/github/cb'];
export const fastifyPassport = new Authenticator();

export function registerAuth(f: FastifyInstance) {
  // f.decorateRequest('user', null);

  f.register(fastifySession, {
    sessionName: 'session',
    cookieName: 'specfy-app-session',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      // options for setCookie, see https://github.com/fastify/fastify-cookie
    },
    key: fs.readFileSync(path.join(__dirname, '..', '..', 'secret-key')),
  });
  f.register(fastifyPassport.initialize());
  f.register(fastifyPassport.secureSession());

  // JSON WEB TOKEN
  fastifyPassport.use(
    'jwt',
    new JwtStrategy(
      {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (jwt_payload: JWT, done) => {
        const user = await prisma.users.findUnique({
          where: { id: jwt_payload.id },
        });
        if (user) {
          return done(null, user);
        }

        // No user
        return done(null, false);
      }
    )
  );

  // GITHUB OAUTH
  fastifyPassport.use(
    'github',
    new GithubStrategy(
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
    )
  );

  fastifyPassport.registerUserSerializer(async (user: Users) => {
    console.log('on serialize');
    return user.id;
  });

  // Deserializer will fetch the user from the database when a request with an id in the session arrives
  fastifyPassport.registerUserDeserializer(async (id: string) => {
    console.log('on deserialise');
    return await prisma.users.findUnique({ where: { id } });
  });

  // Cookie pre validation
  f.addHook('preValidation', async (req) => {
    let id = req.session.id;
    if (!id && env('DEFAULT_ACCOUNT')) {
      console.log('bon', env('DEFAULT_ACCOUNT'));
      // In dev we can auto-load the default user
      const tmp = await prisma.users.findUnique({
        where: { email: env('DEFAULT_ACCOUNT')! },
      });
      if (!tmp) {
        throw new Error('Missing default account');
      }
      id = tmp.id;
    }

    if (!id) {
      return;
    }

    const user = await prisma.users.findUnique({
      where: { id },
    });
    const perms = await prisma.perms.findMany({
      where: {
        userId: id,
      },
      include: { Org: true },
    });
    req.user = user!;
    req.perms = perms;
  });

  // Fallback on Json web token if any
  f.addHook(
    'preValidation',
    //@ts-expect-error
    fastifyPassport.authenticate('jwt', async (req, res, err, user?: Users) => {
      if (req.user) {
        return;
      }

      if (!user) {
        return;
      }

      const perms = await prisma.perms.findMany({
        where: {
          userId: user.id,
        },
        include: { Org: true },
      });
      req.user = user;
      req.perms = perms;
      req.session.set('id', user.id);
    })
  );

  // Final check to see if we are connected
  f.addHook('preValidation', (req, res, done) => {
    if (req.user) {
      done();
      return;
    }

    if (ALLOW_GUEST.includes(req.routerPath)) {
      done();
      return;
    }

    unauthorized(res);
  });
}
