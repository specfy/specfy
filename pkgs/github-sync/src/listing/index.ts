import type { BaseProvider } from '../index.js';
import type { ProviderFile } from '../provider/base.js';

export async function listing(
  opts: { provider: BaseProvider; acc: ProviderFile[] },
  path: string
) {
  const files = await opts.provider.listDir(path);

  for (const file of files) {
    if (file.type === 'dir') {
      await listing(opts, file.fp);
      continue;
    }

    if (!file.name.endsWith('.md')) {
      continue;
    }

    opts.acc.push(file);
  }
}
