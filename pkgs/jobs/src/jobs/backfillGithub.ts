import fs from 'node:fs/promises';

import { nanoid, sentry } from '@specfy/core';
import { getTemporaryToken } from '@specfy/github';
import {
  formatCommitsToIndex,
  getDefaultConfig,
  indexCommits,
} from '@specfy/models';
import { analyzeCommit, listHashes } from '@specfy/sync';
import { $ } from 'execa';

import type {
  CommitAnalysis,
  JobBackfillGithubConfig,
  JobWithOrgProject,
  SyncConfigFull,
} from '@specfy/models';

import { Job } from '../Job.js';

const COMMITS = 30;

export class JobBackfillGithub extends Job {
  token?: string;
  folderName?: string;

  async process(job: JobWithOrgProject): Promise<void> {
    const config = job.config as JobBackfillGithubConfig;
    const l = this.l;

    if (!job.Org || !job.Project) {
      this.mark('failed', 'missing_dependencies');
      return;
    }
    if (!job.Org.githubInstallationId) {
      this.mark('failed', 'org_not_installed');
      return;
    }

    const settings: SyncConfigFull = {
      ...getDefaultConfig(),
      ...config.settings,
    };
    const identifier = config.url;
    const [, repo] = identifier.split('/');

    // Acquire a special short lived token that allow us to clone the repository
    try {
      l.info('Getting temporary token from GitHub');
      this.token = await getTemporaryToken({
        installationId: job.Org.githubInstallationId,
        repo,
      });
    } catch (err: unknown) {
      this.mark('failed', 'cant_auth_github', err);
      sentry.captureException(err);
      return;
    }

    // Clone into a tmp folder
    this.folderName = `/tmp/specfy_clone_${job.id}_${nanoid()}`;
    try {
      l.info('Cloning repository...');
      const res =
        await $`git clone --branch ${settings.branch} https://x-access-token:${this.token}@github.com/${config.url}.git --depth ${COMMITS} ${this.folderName}`;

      if (res.exitCode !== 0) {
        this.mark('failed', 'unknown');
        return;
      }

      await fs.access(this.folderName);
    } catch (err: unknown) {
      this.mark('failed', 'failed_to_clone', err);
      sentry.captureException(err);
      return;
    }

    l.info('Listing hash...');
    const hashes = await listHashes(this.folderName, COMMITS);
    l.info({ count: hashes.length }, 'Listed hashes');

    if (hashes.length <= 0) {
      l.info('No commit to analyze');
      this.mark('success', 'success');
      return;
    }

    // Analyze every commits
    l.info('Analyzing...');
    const history: CommitAnalysis[] = [];
    const emails: string[] = [];
    for (const hash of hashes) {
      const an = await analyzeCommit({ root: this.folderName, commit: hash });
      if (an) {
        emails.push(...an.info.authors.map((author) => author.email));
        history.push(an);
      }
    }

    if (history.length <= 0) {
      l.info('No commit to index');
      this.mark('failed', 'unknown');
      return;
    }

    l.info('Formatting...');
    const formatted = await formatCommitsToIndex({
      emails,
      commits: history,
      orgId: job.orgId,
      projectId: job.projectId!,
      sourceId: config.sourceId,
    });

    await indexCommits({ commits: formatted, l });

    this.mark('success', 'success');
  }

  /**
   * Clean up
   */
  async teardown(): Promise<void> {
    // nothing
  }
}
