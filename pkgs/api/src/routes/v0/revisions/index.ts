import type { FastifyPluginCallback } from 'fastify';

import blobsList from './blobs/list.js';
import checks from './checks.js';
import comment from './comment.js';
import create from './create.js';
import get from './get.js';
import list from './list.js';
import merge from './merge.js';
import rebase from './rebase.js';
import update from './update.js';
import upload from './upload.js';

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
