import fs from 'node:fs/promises';
import path from 'node:path';

import { envs, isProd, nanoid, sentry } from '@specfy/core';
import { prisma } from '@specfy/db';
import { sync } from '@specfy/github-sync';
import type { JobWithOrgProject } from '@specfy/models';
import { $ } from 'execa';
import { Octokit } from 'octokit';

import { Job } from '../Job.js';
import { github } from '../app.js';

export class JobDeploy extends Job {
  folderName?: string;
  deployId?: number;
  token?: string;

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

        l.info('Updating Github deployment status');
        const mark = this.getMark();
        const [owner, repo] = job.Project!.githubRepository!.split('/');
        const projUrl = `${envs.APP_HOSTNAME}/${job.orgId}/${
          job.Project!.slug
        }`;
        await authClient.rest.repos.createDeploymentStatus({
          owner,
          repo,
          deployment_id: this.deployId,
          state: mark?.status === 'failed' ? 'error' : 'success',
          environment_url: projUrl,
          log_url: `${projUrl}/jobs/${job.id}`,
        });
      } catch (err) {
        this.l.error('Cant update Github deployment status', err);
        sentry.captureException(err);
      }
    }
  }

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

    if (!job.Project.githubRepository) {
      this.mark('failed', 'project_not_installed');
      return;
    }

    const ref = config.hook?.ref || 'main';
    const [owner, repo] = job.Project.githubRepository.split('/');

    // Acquire a special short lived token that allow us to clone the repository
    try {
      l.info('Getting temporary token from github');
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

    // Notify Github that we started deploying
    try {
      l.info('Creating Github deployment in Github');

      const authClient = new Octokit({
        auth: this.token,
      });
      const res = await authClient.rest.repos.createDeployment({
        owner,
        repo,
        ref,
        environment: `Production – specfy.io/${job.Org.id}/${job.Project.slug}`,
        production_environment: true,
        auto_merge: false,
        required_contexts: [],
      });
      if (res.status === 201) {
        this.deployId = res.data.id;

        l.info(
          `Deployment available: https://github.com/${owner}/${repo}/deployments/${encodeURIComponent(
            res.data.environment
          )}`
        );
      } else {
        this.mark('failed', 'failed_to_start_github_deployment');
        return;
      }

      l.info('Updating deployment status');

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
    const projConfig = job.Project.config;
    try {
      l.info('Cloning repository');
      const res =
        await $`git clone --branch ${projConfig.branch} https://x-access-token:${this.token}@github.com/${config.url}.git --depth 1 ${this.folderName}`;

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

    // // Checkout at the correct ref
    // try {
    //   const res = await $`cd folder && git checkout ${ref}`;

    //   if (res.exitCode !== 0) {
    //     this.mark('failed', 'unknown');
    //     return;
    //   }
    // } catch (err: unknown) {
    //   this.mark('failed', 'failed_to_checkout', err);
    //   return;
    // }

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
      this.l.info(
        JSON.stringify({ root: this.folderName, projConfig }),
        'Start sync with configuration'
      );

      await sync({
        orgId: job.orgId,
        projectId: job.projectId!,
        token: key.id,
        root: this.folderName,
        dryRun: false,
        stackEnabled: projConfig.stack.enabled,
        stackPath: path.join(this.folderName, projConfig.stack.path),
        docEnabled: projConfig.documentation.enabled,
        docPath: path.join(this.folderName, projConfig.documentation.path),
        autoLayout: config.autoLayout === true,
        hostname: !isProd
          ? envs.API_HOSTNAME?.replace('localhost', '127.0.0.1')
          : envs.API_HOSTNAME,
        logger: this.l,
      });

      this.mark('success', 'success');
    } catch (err: unknown) {
      this.mark('failed', 'failed_to_deploy', err);
      sentry.captureException(err);
      return;
    }
  }
}
