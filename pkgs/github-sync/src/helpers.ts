import type { Prisma, Projects, Users } from '@specfy/db';
import {
  createDocument,
  DocumentsParser,
  uploadedDocumentsToDB,
} from '@specfy/models';

import { listing } from './listing/index.js';
import type { ProviderFile } from './provider/base.js';
import { FSProvider } from './provider/fs.js';
import { transform } from './transform/index.js';

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
