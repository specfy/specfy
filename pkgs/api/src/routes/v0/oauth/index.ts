import type { FastifyPluginCallback } from 'fastify';

import github from './github';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(github, { prefix: '/oauth' });

  done();
};

export default fn;
