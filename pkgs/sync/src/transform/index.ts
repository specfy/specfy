import path from 'node:path';

import type { BaseProvider, ProviderFile } from '../provider/base.js';

export type TransformedFile = ProviderFile & { content: any };

export async function transform(
  provider: BaseProvider,
  files: ProviderFile[]
): Promise<TransformedFile[]> {
  const list = [];

  for (const file of files) {
    const content = await provider.open(path.join(provider.basePath, file.fp));

    list.push({ ...file, content });
  }

  return list;
}
