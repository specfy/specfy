import fs from 'node:fs/promises';
import path from 'node:path';
import timer from 'node:timers/promises';
import util from 'node:util';

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
import kleur from 'kleur';
import ora from 'ora';

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
  dryRun,
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
  dryRun: boolean;
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
    l.info(
      kleur.bold().magenta(`${figures.triangleRight} Syncing`),
      kleur.cyan(docPath)
    );
    const spinnerListing = ora(`Listing`).start();

    await timer.setTimeout(100);

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
    spinnerListing.succeed('Listed');

    // --- Transform
    const spinnerParsing = ora(`Parsing`).start();
    docs = await transform(provider, list);
    spinnerParsing.succeed('Parsed');

    // Log
    l.info(
      kleur.bold().blue(`${figures.arrowRight}`),
      'Found',
      list.length,
      'files'
    );
    l.info(list.map((file) => file.fp));
    l.info('');
  } else {
    l.info(kleur.bold().yellow(`${figures.info} Documentation Skipped`));
  }

  // ------- Stack
  let stack: Payload | null = null;
  if (stackEnabled) {
    l.info('');
    l.info('-- Stack');

    l.info(
      kleur.bold().magenta(`${figures.triangleRight} Syncing`),
      kleur.cyan(stackPath)
    );

    const spinner = ora(`Analysing ${stackPath}`).start();
    stack = flatten(
      await analyser({
        provider: new StackProvider({
          path: stackPath,
          ignorePaths: [],
        }),
      })
    );

    spinner.succeed('Analysed');

    // output to folder for debug / manual review
    const file = path.join(root, 'stack.json');
    await fs.writeFile(file, JSON.stringify(stack.toJson(root), undefined, 2));
    l.info(
      kleur.bold().blue(`${figures.arrowRight}`),
      'Output',
      kleur.green(file)
    );
  } else {
    l.info(kleur.bold().yellow(`${figures.info} Stack Skipped`));
  }

  if (!docEnabled && !stackEnabled) {
    checkNothingMsg();
    return;
  }

  // --- Upload
  l.info('');
  l.info('-- Deploy');
  const spinnerUploading = ora(`Uploading`).start();
  const body = prepBody({
    orgId,
    projectId,
    docs,
    stack,
    autoLayout,
    baseUrl,
    root,
  });

  if (dryRun) {
    spinnerUploading.stopAndPersist({ text: 'Uploaded (dry-run)' });
    l.info('');
    l.info(util.inspect(body, false, 10, true));
    return;
  }

  const resUp = await upload({ body, token, baseUrl, logger });
  if ('error' in resUp) {
    // There is nothing to commit
    if (
      resUp.error.code === 'cant_create' &&
      resUp.error.reason === 'no_diff'
    ) {
      spinnerUploading.succeed('Uploaded');
      l.info(kleur.bold().blue(`${figures.info} No diff with production`));

      // It's perfectly okay that there is no diff, could be that we have found nothing or just nothing has changed
      return;
    }

    spinnerUploading.fail('Uploaded');

    l.info('');
    l.error(kleur.red('Failed to upload, received:'));
    l.error(JSON.stringify(resUp.error, null, 2));

    throw new Error('Failed to upload');
  }

  if (resUp.data.stats.stack && resUp.data.stats.stack?.deleted > 1) {
    l.error(resUp.data.stats, kleur.red('Fail Safe: too many deletion'));
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
  spinnerUploading.succeed('Uploaded');

  l.info('');
  l.info('> Revision created:', kleur.underline(get.data.url));

  // --- Deduping
  const spinnerDedup = ora(`Closing old revisions`).start();
  const count = await closeOldRevisions({
    id,
    orgId,
    projectId,
    token,
    baseUrl,
    logger,
  });
  spinnerDedup.succeed(`Closing old revisions (${count})`);

  const spinnerMerge = ora(`Merging`).start();
  await merge({ id, orgId, projectId, token, baseUrl, logger });
  spinnerMerge.succeed(`Merged`);
}
