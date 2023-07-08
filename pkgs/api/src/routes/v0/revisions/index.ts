import type { FastifyPluginAsync } from 'fastify';

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

const fn: FastifyPluginAsync = async (f) => {
  await await f.register(create, { prefix: '/revisions' });
  await await f.register(list, { prefix: '/revisions' });
  await await f.register(upload, { prefix: '/revisions/upload' });
  await await f.register(get, { prefix: '/revisions/:revision_id' });
  await await f.register(update, { prefix: '/revisions/:revision_id' });
  await await f.register(blobsList, {
    prefix: '/revisions/:revision_id/blobs',
  });
  await await f.register(merge, { prefix: '/revisions/:revision_id/merge' });
  await await f.register(comment, {
    prefix: '/revisions/:revision_id/comment',
  });
  await await f.register(checks, { prefix: '/revisions/:revision_id/checks' });
  await await f.register(rebase, { prefix: '/revisions/:revision_id/rebase' });
};

export default fn;
