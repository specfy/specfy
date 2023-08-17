import fs from 'node:fs/promises';
import path from 'node:path';
import timer from 'node:timers/promises';
import util from 'node:util';

import { l } from '@specfy/core';
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
rules.loadAllRules();

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
}) {
  if (!(await checkPaths(docPath, stackPath))) {
    throw new Error('Invalid path');
  }

  const baseUrl = `${hostname}/0`;

  l.log('');

  // ------- Documentation
  let docs: TransformedFile[] = [];
  if (docEnabled) {
    l.log('-- Documentation');
    l.log(
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
    l.log(
      kleur.bold().blue(`${figures.arrowRight}`),
      'Found',
      list.length,
      'files'
    );
    l.log(list.map((file) => file.fp));
    l.log('');
  } else {
    l.log(kleur.bold().yellow(`${figures.info} Documentation Skipped`));
  }

  // ------- Stack
  let stack: Payload | null = null;
  if (stackEnabled) {
    l.log('');
    l.log('-- Stack');

    l.log(
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
    l.log(
      kleur.bold().blue(`${figures.arrowRight}`),
      'Output',
      kleur.green(file)
    );
  } else {
    l.log(kleur.bold().yellow(`${figures.info} Stack Skipped`));
  }

  if (!docEnabled && !stackEnabled) {
    checkNothingMsg();
    return;
  }

  // --- Upload
  l.log('');
  l.log('-- Deploy');
  const spinnerUploading = ora(`Uploading`).start();
  const body = prepBody({ orgId, projectId, docs, stack, autoLayout, baseUrl });

  if (dryRun) {
    spinnerUploading.stopAndPersist({ text: 'Uploaded (dry-run)' });
    l.log('');
    l.log(util.inspect(body, false, 10, true));
    return;
  }

  const resUp = await upload({ body, token, baseUrl });
  if ('error' in resUp) {
    // There is nothing to commit
    if (
      resUp.error.code === 'cant_create' &&
      resUp.error.reason === 'no_diff'
    ) {
      spinnerUploading.succeed('Uploaded');
      l.log(kleur.bold().blue(`${figures.info} No diff with production`));

      throw new Error();
    }

    spinnerUploading.fail('Uploaded');

    l.log('');
    l.error(kleur.red('Failed to upload, received:'));
    l.error(JSON.stringify(resUp.error, null, 2));

    throw new Error();
  }

  const id = resUp.data.id;

  const resGet = await getRevision({ id, orgId, projectId, token, baseUrl });
  const get = await resGet.json();
  spinnerUploading.succeed('Uploaded');

  l.log('');
  l.log('> Revision created:', kleur.underline(get.data.url));

  // --- Deduping
  const spinnerDedup = ora(`Closing old revisions`).start();
  const count = await closeOldRevisions({
    id,
    orgId,
    projectId,
    token,
    baseUrl,
  });
  spinnerDedup.succeed(`Closing old revisions (${count})`);

  const spinnerMerge = ora(`Merging`).start();
  await merge({ id, orgId, projectId, token, baseUrl });
  spinnerMerge.succeed(`Merged`);
}
