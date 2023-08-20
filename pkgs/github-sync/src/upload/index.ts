import type { Logger } from '@specfy/core';
import { l as defaultLogger } from '@specfy/core';
import type { PostUploadRevision } from '@specfy/models';
import type { Payload } from '@specfy/stack-analyser';

import type { TransformedFile } from '../transform/index.js';

const title = 'fix(documentation): sync from git';

interface Params {
  orgId: string;
  projectId: string;
  token: string;
  baseUrl: string;
  logger?: Logger;
}

export function prepBody({
  orgId,
  projectId,
  docs,
  stack,
  autoLayout,
}: Omit<Params, 'token'> & {
  docs: TransformedFile[];
  stack?: Payload | null;
  autoLayout?: boolean | null;
}): PostUploadRevision['Body'] {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  return {
    orgId,
    projectId,
    name: `${title} ${date}`,
    description: { content: [], type: 'doc' },
    source: 'github',
    blobs: docs.map((doc) => {
      return {
        path: doc.fp,
        content: doc.content,
      };
    }),
    stack: stack?.toJson() || null,
    autoLayout: autoLayout === true,
  };
}

export async function upload({
  body,
  token,
  baseUrl,
  logger = defaultLogger,
}: Omit<Params, 'orgId' | 'projectId'> & {
  body: PostUploadRevision['Body'];
}): Promise<{ error: any } | { data: { id: string } }> {
  const endpoint = `${baseUrl}/revisions/upload`;
  logger.info('Uploading to', { endpoint });
  const res = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      ['content-type']: 'application/json',
      authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  return json;
}

export async function getRevision({
  id,
  orgId,
  projectId,
  token,
  baseUrl,
  logger = defaultLogger,
}: Params & {
  id: string;
}) {
  const endpoint = `${baseUrl}/revisions/${id}?org_id=${orgId}&project_id=${projectId}`;
  logger.info('Getting revision', { endpoint });
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (res.status !== 200) {
    logger.error(JSON.stringify(await res.json(), null, 2));
    throw new Error("Can't get the revision");
  }

  return res;
}

export async function closeOldRevisions({
  orgId,
  projectId,
  id,
  token,
  baseUrl,
  logger = defaultLogger,
}: Params & {
  id: string;
}) {
  const usp = new URLSearchParams({
    org_id: orgId,
    project_id: projectId,
    search: title,
    status: 'opened',
  });
  const endpoint = `${baseUrl}/revisions?${usp.toString()}`;
  logger.info('Listing revisions', { endpoint });

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (res.status !== 200) {
    logger.error("Can't list old revisions");
    return;
  }

  const list = (await res.json()).data;
  let count = 0;
  for (const rev of list) {
    if (rev.id === id) {
      continue;
    }

    const up = await fetch(
      `${baseUrl}/revisions/${rev.id}?org_id=${orgId}&project_id=${projectId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'closed',
        }),
        headers: {
          ['content-type']: 'application/json',
          authorization: `Bearer ${token}`,
        },
      }
    );

    if (up.status !== 200) {
      logger.error("Can't lock previous revision");
      return;
    }
    count += 1;
  }

  return count;
}

export async function merge({
  orgId,
  projectId,
  id,
  token,
  baseUrl,
  logger = defaultLogger,
}: Params & {
  id: string;
}) {
  const endpoint = `${baseUrl}/revisions/${id}/merge?org_id=${orgId}&project_id=${projectId}`;
  logger.info('Merging revision', { endpoint });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (res.status !== 200) {
    logger.info('');
    logger.error(JSON.stringify((await res.json()).error, null, 2));
    throw new Error("Can't merge");
  }
}
