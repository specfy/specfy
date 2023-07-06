import fs from 'node:fs/promises';
import path from 'node:path';

import { $, execa } from 'execa';
import { Octokit } from 'octokit';

import { dirname, env, isProd } from '../../../common/env.js';
import { nanoid } from '../../../common/id.js';
import { prisma } from '../../../db/index.js';
import type {
  JobDeployConfig,
  JobWithOrgProject,
} from '../../../models/jobs/type.js';
import { Job } from '../Job.js';
import { github } from '../app.js';

export class JobDeploy extends Job {
  folderName?: string;
  deployId?: number;
  token?: string;

  async teardown(job: JobWithOrgProject): Promise<void> {
    // Clean up source code when we are done
    if (this.folderName) {
      try {
        await fs.access(this.folderName);
        try {
          await fs.rm(this.folderName, { force: true, recursive: true });
        } catch (err: unknown) {
          this.mark('failed', 'failed_to_cleanup', err);
        }
      } catch {
        // do nothing on fs.access, we just couldn't git clone
      }
    }

    if (this.deployId) {
      try {
        const authClient = new Octokit({
          auth: this.token,
        });

        const mark = this.getMark();
        const [owner, repo] = job.Project!.githubRepository!.split('/');
        const projUrl = `${env('APP_HOSTNAME')!}/${job.orgId}/${
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
      }
    }
  }

  async process(job: JobWithOrgProject): Promise<void> {
    const config = job.config as unknown as JobDeployConfig;

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
      return;
    }

    // Notify Github that we started deploying
    try {
      const authClient = new Octokit({
        auth: this.token,
      });
      const res = await authClient.rest.repos.createDeployment({
        owner,
        repo,
        ref,
        environment: `Production – ${job.Org.id}/${job.Project.slug}`,
        production_environment: true,
        auto_merge: false,
        required_contexts: [],
      });
      if (res.status === 201) {
        this.deployId = res.data.id;
      } else {
        this.mark('failed', 'failed_to_start_github_deployment');
        return;
      }

      const projUrl = `${env('APP_HOSTNAME')!}/${job.orgId}/${
        job.Project!.slug
      }`;
      await authClient.rest.repos.createDeploymentStatus({
        owner,
        repo,
        deployment_id: this.deployId,
        state: 'in_progress',
        auto_inactive: true,
        environment_url: projUrl,
        log_url: `${projUrl}/jobs/${job.id}`,
      });
    } catch (err) {
      this.mark('failed', 'failed_to_start_github_deployment', err);
      return;
    }

    // Clone into a tmp folder
    this.folderName = `/tmp/specfy_clone_${job.id}_${nanoid()}`;
    try {
      const res =
        await $`git clone https://x-access-token:${this.token}@github.com/${config.url}.git --depth 1 ${this.folderName}`;

      if (res.exitCode !== 0) {
        this.mark('failed', 'unknown');
        return;
      }

      await fs.access(this.folderName);
    } catch (err: unknown) {
      this.mark('failed', 'failed_to_clone', err);
      return;
    }

    // Checkout at the correct ref
    try {
      const res = await $`git checkout ${ref}`;

      if (res.exitCode !== 0) {
        this.mark('failed', 'unknown');
        return;
      }
    } catch (err: unknown) {
      this.mark('failed', 'failed_to_checkout', err);
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
      const bin = path.join(
        dirname,
        '../../..',
        'node_modules/.bin/specfy-sync'
      );
      const args = [
        bin,
        'run',
        '-t',
        key.id,
        '-o',
        job.orgId,
        '-p',
        job.projectId!,
        '-d',
        '/',
        config.autoLayout ? '--auto-layout' : '',
        this.folderName,
      ];
      const envs = {
        // Bug in node-fetch that do not resolve localhost correctly
        SPECFY_HOSTNAME: !isProd
          ? env('API_HOSTNAME')?.replace('localhost', '127.0.0.1')
          : undefined,
      };

      // TODO: redact secret
      this.l.info('Executing', JSON.stringify({ args, envs }));

      const res = await execa('node', args, { env: envs });
      this.l.info('Stdout', res.stdout);

      if (res.exitCode !== 0) {
        this.mark('failed', 'unknown');
        return;
      }
    } catch (err: unknown) {
      this.mark('failed', 'failed_to_deploy', err);
      return;
    }

    this.mark('success', 'success');
  }
}
