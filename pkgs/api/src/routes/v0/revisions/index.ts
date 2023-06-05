import type { FastifyPluginCallback } from 'fastify';

import blobsList from './blobs/list';
import checks from './checks';
import comment from './comment';
import create from './create';
import get from './get';
import list from './list';
import merge from './merge';
import rebase from './rebase';
import update from './update';
import upload from './upload';

const fn: FastifyPluginCallback = async (f, _, done) => {
  f.register(create, { prefix: '/revisions' });
  f.register(list, { prefix: '/revisions' });
  f.register(upload, { prefix: '/revisions/upload' });
  f.register(get, { prefix: '/revisions/:revision_id' });
  f.register(update, { prefix: '/revisions/:revision_id' });
  f.register(blobsList, { prefix: '/revisions/:revision_id/blobs' });
  f.register(merge, { prefix: '/revisions/:revision_id/merge' });
  f.register(comment, { prefix: '/revisions/:revision_id/comment' });
  f.register(checks, { prefix: '/revisions/:revision_id/checks' });
  f.register(rebase, { prefix: '/revisions/:revision_id/rebase' });

  done();
};

export default fn;
