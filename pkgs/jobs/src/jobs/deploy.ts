import fs from 'node:fs/promises';

import { envs, isProd, nanoid, sentry } from '@specfy/core';
import { prisma } from '@specfy/db';
import { github } from '@specfy/github';
import { sync, ErrorSync } from '@specfy/sync';
import { $ } from 'execa';
import { Octokit } from 'octokit';

import type { JobWithOrgProject } from '@specfy/models';

import { Job } from '../Job.js';

export class JobDeploy extends Job {
  folderName?: string;
  deployId?: number;
  token?: string;

  async process(job: JobWithOrgProject): Promise<void> {
    const config = job.config;
    const l = this.l;

    if (!job.Org || !job.Project) {
      this.mark('failed', 'missing_dependencies');
      return;
    }

    if (!job.Org.githubInstallationId) {
      this.mark('failed', 'org_not_installed');
      return;
    }

    const source = await prisma.sources.findFirst({
      where: { id: config.sourceId },
    });

    // Just make sure the project wasn't uninstalled in the meantime
    if (!source) {
      this.mark('failed', 'project_not_installed');
      return;
    }

    const settings = config.settings;
    const ref = config.hook?.ref || settings.branch;
    const identifier = config.url;
    const [owner, repo] = identifier.split('/');

    this.l.info('Configuration', { ref, job: job.config });

    // Acquire a special short lived token that allow us to clone the repository
    try {
      l.info('Getting temporary token from GitHub');
      const auth = await github.octokit.rest.apps.createInstallationAccessToken(
        {
          installation_id: job.Org.githubInstallationId,
          repositories: [repo],
          permissions: {
            environments: 'write',
            statuses: 'write',
            deployments: 'write',
            contents: 'read',
          },
        }
      );
      this.token = auth.data.token;
    } catch (err: unknown) {
      this.mark('failed', 'cant_auth_github', err);
      sentry.captureException(err);
      return;
    }

    // Notify GitHub that we started deploying
    try {
      l.info('Creating deployment in GitHub');

      const authClient = new Octokit({
        auth: this.token,
      });
      const res = await authClient.rest.repos.createDeployment({
        owner,
        repo,
        ref,
        environment: `Production - specfy.io/${job.Org.id}/${job.Project.slug}`,
        production_environment: true,
        auto_merge: false,
        required_contexts: [],
      });
      if (res.status === 201) {
        this.deployId = res.data.id;

        l.info(
          `Deployment available: https://github.com/${owner}/${repo}/deployments`
        );
      } else {
        this.mark('failed', 'failed_to_start_github_deployment');
        return;
      }

      l.info('Updating GitHub deployment status');

      const projUrl = `${envs.APP_HOSTNAME}/${job.orgId}/${job.Project.slug}`;
      await authClient.rest.repos.createDeploymentStatus({
        owner,
        repo,
        deployment_id: this.deployId,
        state: 'in_progress',
        auto_inactive: true,
        environment_url: projUrl,
        log_url: `${projUrl}/deploys/${job.id}`,
      });
    } catch (err) {
      this.mark('failed', 'failed_to_start_github_deployment', err);
      sentry.captureException(err);
      return;
    }

    // Clone into a tmp folder
    this.folderName = `/tmp/specfy_clone_${job.id}_${nanoid()}`;
    try {
      l.info('Cloning repository...');
      const res =
        await $`git clone --branch ${settings.branch} https://x-access-token:${this.token}@github.com/${config.url}.git --depth 1 ${this.folderName}`;

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

    const key = await prisma.keys.findFirst({
      where: {
        orgId: job.orgId,
        projectId: job.projectId,
      },
    });

    if (!key) {
      this.mark('failed', 'no_api_key');
      return;
    }

    // Execute deploy
    try {
      await sync({
        orgId: job.orgId,
        projectId: job.projectId!,
        jobId: job.id,
        sourceId: config.sourceId,
        token: key.id,
        root: this.folderName,
        settings,
        autoLayout: config.autoLayout === true,
        hostname: !isProd
          ? envs.API_HOSTNAME?.replace('localhost', '127.0.0.1')
          : envs.API_HOSTNAME,
        logger: this.l,
      });

      this.mark('success', 'success');
    } catch (err: unknown) {
      if (err instanceof ErrorSync) {
        this.mark('failed', err.code);
      } else {
        this.mark('failed', 'failed_to_deploy', err);
      }
      sentry.captureException(err);
      return;
    }
  }

  /**
   * Clean up
   */
  async teardown(job: JobWithOrgProject): Promise<void> {
    const l = this.l;

    l.info('Cleaning');

    // Clean up source code when we are done
    if (this.folderName) {
      try {
        await fs.access(this.folderName);
        try {
          await fs.rm(this.folderName, { force: true, recursive: true });
        } catch (err: unknown) {
          this.mark('failed', 'failed_to_cleanup', err);
          sentry.captureException(err);
        }
      } catch (err) {
        // do nothing on fs.access, we just couldn't git clone
        sentry.captureException(err);
      }
    }

    if (this.deployId) {
      try {
        const authClient = new Octokit({
          auth: this.token,
        });

        l.info('Updating GitHub deployment status');
        const mark = this.getMark();
        const [owner, repo] = job.config.url.split('/');
        const projUrl = `${envs.APP_HOSTNAME}/${job.orgId}/${
          job.Project!.slug
        }`;
        await authClient.rest.repos.createDeploymentStatus({
          owner,
          repo,
          deployment_id: this.deployId,
          state: mark?.status === 'failed' ? 'error' : 'success',
          environment_url: projUrl,
          log_url: `${projUrl}/deploys/${job.id}`,
        });
      } catch (err) {
        this.l.error('Cant update GitHub deployment status', err);
        sentry.captureException(err);
      }
    }
  }
}
