import fs from 'node:fs/promises';
import path from 'node:path';

import type { SyncConfig } from '@specfy/models';

export const CONFIG_FILE_NAME = '.specfyrc.json';

export async function checkConfigFile(
  root: string
): Promise<SyncConfig | false> {
  const fp = path.join(root, CONFIG_FILE_NAME);
  try {
    const file = await fs.readFile(fp);
    return JSON.parse(file.toString());
  } catch (e) {
    return false;
  }
}
