import crypto from 'crypto';

import { envs } from '@specfy/core';
import { prisma } from '@specfy/db';
import { Strategy as LocalStrategy } from 'passport-local';

import { AuthError } from './errors.js';

import type { Authenticator } from '@fastify/passport';
import type { FastifyInstance } from 'fastify';

// TODO: once per user
const SALT = envs.PASSWORD_SALT;
const LEN = 32;
const ITER = 310000;
const DIG = 'sha256';

export function pbkdf2(pwd: string) {
  return crypto.pbkdf2Sync(pwd, SALT, ITER, LEN, DIG);
}

export function registerLocal(
  _fastify: FastifyInstance,
  passport: Authenticator
) {
  const reg = new LocalStrategy(
    {
      usernameField: 'email',
    },
    async (email, password, cb) => {
      const user = await prisma.users.findUnique({
        where: { email: email },
      });

      if (!user) {
        return cb(
          new AuthError('email', 'unknown', 'This account does not exists.')
        );
      }
      if (!user.password) {
        return cb(
          new AuthError(
            'email',
            'no_pwd',
            'This account is not using a password.'
          )
        );
      }

      const res = pbkdf2(password);
      if (!crypto.timingSafeEqual(Buffer.from(user.password, 'hex'), res)) {
        return cb(
          new AuthError('password', 'invalid', 'The password is incorrect')
        );
      }

      return cb(null, user);
    }
  );

  passport.use('local', reg);
}
