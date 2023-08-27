import type { Prisma, Projects, Users } from '@specfy/db';
import { FSProvider, listing, transform } from '@specfy/github-sync';
import type { ProviderFile } from '@specfy/github-sync';

import { createDocument } from './documents/index.js';
import { DocumentsParser } from './prosemirror/index.js';
import { uploadedDocumentsToDB } from './revisions/index.js';

export async function syncFolder(
  folder: string,
  project: Projects,
  user: Users,
  tx: Prisma.TransactionClient
) {
  const list: ProviderFile[] = [];
  const provider = new FSProvider({
    path: folder,
    ignorePaths: [],
  });

  await listing(
    {
      provider,
      acc: list,
    },
    '/'
  );
  const docs = await transform(provider, list);
  const parser = new DocumentsParser(
    docs.map((doc) => {
      return {
        path: doc.fp,
        content: doc.content,
      };
    }),
    project
  );
  const parsed = parser.parse();
  const clean = uploadedDocumentsToDB(parsed, [], {
    orgId: project.orgId,
    projectId: project.id,
    source: 'fixtures',
  });

  await Promise.all(
    clean.blobs.map(async (blob) => {
      return await createDocument({
        user: user,
        data: blob.current,
        tx,
      });
    })
  );
}
