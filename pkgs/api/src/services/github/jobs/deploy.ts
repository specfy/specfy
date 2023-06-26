import fs from 'node:fs/promises';

import { $, execa } from 'execa';

import { env, isProd } from '../../../common/env.js';
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

  async teardown(): Promise<void> {
    // Clean up source code when we are done
    if (!this.folderName) {
      return;
    }

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

    // Acquire a special short lived token that allow us to clone the repository
    let token: string;
    try {
      const auth = await github.octokit.rest.apps.createInstallationAccessToken(
        {
          installation_id: job.Org.githubInstallationId,
          repositories: [job.Project.githubRepository.split('/')[1]],
          permissions: {
            environments: 'write',
            // statuses: 'write',
            contents: 'read',
          },
        }
      );
      token = auth.data.token;
    } catch (err: unknown) {
      this.mark('failed', 'cant_auth_github', err);
      return;
    }

    // Clone into a tmp folder
    this.folderName = `/tmp/specfy_clone_${job.id}_${nanoid()}`;
    try {
      const res =
        await $`git clone https://x-access-token:${token}@github.com/${config.url}.git --depth 1 ${this.folderName}`;

      if (res.exitCode !== 0) {
        this.mark('failed', 'unknown');
        return;
      }

      await fs.access(this.folderName);
    } catch (err: unknown) {
      this.mark('failed', 'failed_to_clone', err);
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
      const res = await execa(
        'npx',
        [
          '@specfy/sync',
          'run',
          '-t',
          key.id,
          '-o',
          job.orgId,
          '-p',
          job.projectId!,
          '-d',
          '/',
          this.folderName,
        ],
        {
          env: {
            // Bug in node-fetch that do not resolve localhost correctly
            SPECFY_HOSTNAME: !isProd
              ? env('API_HOSTNAME')?.replace('localhost', '127.0.0.1')
              : undefined,
          },
        }
      );

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
