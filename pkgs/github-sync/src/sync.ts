import fs from 'node:fs/promises';
import path from 'node:path';

import type { Logger } from '@specfy/core';
import { l as defaultLogger } from '@specfy/core';
import type { Payload } from '@specfy/stack-analyser';
import {
  flatten,
  analyser,
  FSProvider as StackProvider,
  rules,
} from '@specfy/stack-analyser';
import figures from 'figures';

import { checkNothingMsg, checkPaths } from './common/helper.js';
import { listing } from './listing/index.js';
import type { ProviderFile } from './provider/base.js';
import { FSProvider } from './provider/fs.js';
import type { TransformedFile } from './transform/index.js';
import { transform } from './transform/index.js';
import {
  closeOldRevisions,
  getRevision,
  merge,
  prepBody,
  upload,
} from './upload/index.js';

// eslint-disable-next-line import/extensions
import '@specfy/stack-analyser/dist/rules/index.js';
rules.loadAll();

export async function sync({
  root,
  token,
  orgId,
  projectId,
  docEnabled,
  docPath,
  stackEnabled,
  stackPath,
  autoLayout,
  hostname = 'https://api.specfy.io',
  logger = defaultLogger,
}: {
  root: string;
  token: string;
  orgId: string;
  projectId: string;
  docEnabled: boolean;
  docPath: string;
  stackEnabled: boolean;
  stackPath: string;
  autoLayout: boolean;
  hostname?: string;
  logger?: Logger;
}) {
  if (!(await checkPaths(docPath, stackPath))) {
    throw new Error('Invalid path');
  }
  const l = logger;

  const baseUrl = `${hostname}/0`;

  l.info('');

  // ------- Documentation
  let docs: TransformedFile[] = [];
  if (docEnabled) {
    l.info('-- Documentation');
    l.info(`${figures.triangleRight} Syncing ${docPath}`);

    l.info('Listing...');
    // --- List
    const list: ProviderFile[] = [];
    const provider = new FSProvider({
      path: docPath,
      ignorePaths: [],
    });

    await listing(
      {
        provider,
        acc: list,
      },
      '/'
    );
    l.info(`Listed ${figures.tick}`);

    // --- Transform
    l.info('Parsing...');
    docs = await transform(provider, list);
    l.info(`Parsed ${figures.tick}`);

    // Log
    l.info(`${figures.arrowRight} Found ${list.length} files`, {
      files: list.map((file) => file.fp),
    });
    l.info('');
  } else {
    l.warn(`${figures.info} Documentation Skipped`);
  }

  // ------- Stack
  let stack: Payload | null = null;
  if (stackEnabled) {
    l.info('');
    l.info('-- Stack');

    l.info(`${figures.triangleRight} Syncing: ${stackPath}`);

    l.info(`Analyzing...`);
    stack = flatten(
      await analyser({
        provider: new StackProvider({
          path: stackPath,
          ignorePaths: [],
        }),
      })
    );
    l.info(`Analyzed ${figures.tick}`);

    // output to folder for debug / manual review
    const file = path.join(root, 'stack.json');
    await fs.writeFile(file, JSON.stringify(stack.toJson(root), undefined, 2));
    // l.info(`${figures.arrowRight} Output`);
    // l.info('Stack', stack.toJson(root));
  } else {
    l.warn(`${figures.info} Stack Skipped`);
  }

  if (!docEnabled && !stackEnabled) {
    checkNothingMsg();
    return;
  }

  // --- Upload
  l.info('');
  l.info('-- Deploy');
  l.info('Uploading to Specfy...');
  const body = prepBody({
    orgId,
    projectId,
    docs,
    stack,
    autoLayout,
    baseUrl,
    root,
  });

  const resUp = await upload({ body, token, baseUrl, logger });
  if ('error' in resUp) {
    // There is nothing to commit
    if (
      resUp.error.code === 'cant_create' &&
      resUp.error.reason === 'no_diff'
    ) {
      l.info(`Uploaded ${figures.tick}`);
      l.info(`${figures.info} No diff with production`);

      // It's perfectly okay that there is no diff, could be that we have found nothing or just nothing has changed
      return;
    }

    l.error(`Uploaded ${figures.cross}`);

    l.info('');
    l.error('Failed to upload, received:');
    l.error(JSON.stringify(resUp.error, null, 2));

    throw new Error('Failed to upload');
  }

  if (resUp.data.stats.stack && resUp.data.stats.stack?.deleted > 1) {
    l.error(resUp.data.stats, 'Fail Safe: too many deletion');
    throw new Error('Too many deletion in the revision');
  }

  const id = resUp.data.id;

  const resGet = await getRevision({
    id,
    orgId,
    projectId,
    token,
    baseUrl,
    logger,
  });
  const get = await resGet.json();
  l.info(`Uploaded ${figures.tick}`);

  l.info('');
  l.info(`${figures.triangleRight} Revision created: ${get.data.url}`);

  // --- Deduplication
  l.info('');
  l.info('Closing old revisions');
  const count = await closeOldRevisions({
    id,
    orgId,
    projectId,
    token,
    baseUrl,
    logger,
  });
  l.info(`Closed (${count}) ${figures.tick}`);

  l.info(`Merging`);
  await merge({ id, orgId, projectId, token, baseUrl, logger });
  l.info(`Merged ${figures.tick}`);
}
