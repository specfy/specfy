import { nanoid, envs, l as logger } from '@specfy/core';
import { prisma } from '@specfy/db';
import JWT from 'jsonwebtoken';
import { Server } from 'socket.io';

import type { PayloadAuth, SocketServer, SocketUser } from './types.js';
import type http from 'node:http';

const l = logger.child({ svc: 'socket' });

export let io: SocketServer;

export function stop() {
  if (!io) {
    return;
  }

  l.info('Socket service stopping');

  io.close();
}

export function start(server: http.Server) {
  l.info('Socket service starting');

  io = new Server(server, {
    path: '/ws',
    serveClient: false,
    cookie: false,
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://app.specfy.io',
        'https://api.specfy.io',
        'https://www.specfy.io',
      ],
    },
  });

  io.use(async (socket, next) => {
    const auth = socket.handshake.auth as PayloadAuth | undefined;
    if (!auth?.userId || !auth.token) {
      return next(new Error('credentials required'));
    }

    let jwt: any;
    try {
      jwt = JWT.verify(auth.token, envs.JWT_SECRET);
      if (!jwt || jwt.id !== auth.userId) {
        return next(new Error('invalid credentials'));
      }
    } catch (e: any) {
      console.error('Error during decode:', e.message);
    }

    const user = await prisma.users.findUnique({
      where: { id: auth.userId },
    });
    if (!user) {
      return next(new Error('failed to auth'));
    }

    const perms = await getSocketPerms(auth.userId);
    socket.data.sessionID = nanoid();
    socket.data.user = user;
    socket.data.perms = perms;

    next();
  });

  io.on('connection', (socket) => {
    if (!socket.data.user) {
      // for some reason
      return;
    }

    joinChannels(socket);
    socket.data;

    // allow the client to request to join rooms
    socket.on('join', async (event) => {
      if (!socket.data.user) {
        // for some reason
        return;
      }
      // TODO: rate limit this somehow

      // User created a new Org
      if (event.orgId && !event.projectId) {
        const perms = await getSocketPerms(socket.data.user.id);
        socket.data.perms = perms;
        joinChannels(socket);
      }
      // User created a new Project
      else if (event.orgId && event.projectId) {
        const perms = await getSocketPerms(socket.data.user.id);
        socket.data.perms = perms;
        joinChannels(socket);
      }
    });
  });
}

async function getSocketPerms(userId: string) {
  return await prisma.perms.findMany({
    where: { userId: userId },
    include: { Org: { include: { Projects: { select: { id: true } } } } },
  });
}

function joinChannels(socket: SocketUser) {
  const list = new Set<string>([socket.data.user!.id]);
  for (const perm of socket.data.perms!) {
    if (!perm.projectId) {
      list.add(`org-${perm.orgId}`);

      for (const project of perm.Org.Projects) {
        list.add(`project-${project.id}`);
      }
      continue;
    }

    list.add(`project-${perm.projectId}`);
  }
  void socket.join(Array.from(list.values()));
}
