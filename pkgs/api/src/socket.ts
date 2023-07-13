import type http from 'node:http';

import JWT from 'jsonwebtoken';
import { Server } from 'socket.io';

import { JWT_SECRET } from './common/auth.js';
import { nanoid } from './common/id.js';
import { prisma } from './db/index.js';
import type { PayloadAuth, SocketServer } from './types/socket.js';

export let io: SocketServer;

export function initSocket(server: http.Server) {
  // const httpServer = http.createServer();
  io = new Server(server, {
    path: '/ws',
    serveClient: false,
    cookie: false,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
    },
  });

  io.use(async (socket, next) => {
    const auth = socket.handshake.auth as PayloadAuth | undefined;
    if (!auth?.userId || !auth.token) {
      return next(new Error('credentials required'));
    }

    let jwt: any;
    try {
      jwt = JWT.verify(auth.token, JWT_SECRET);
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

    const perms = await prisma.perms.findMany({
      where: {
        userId: auth.userId,
      },
      include: { Org: { include: { Projects: { select: { id: true } } } } },
    });
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

    const list = new Set<string>([socket.data.user.id]);
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
  });
}
