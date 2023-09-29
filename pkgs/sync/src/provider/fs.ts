import fs from 'fs/promises';
import path from 'node:path';

import {
  IGNORED_DIVE_REGEX,
  IGNORED_FILENAME_REGEX,
  IGNORED_DIVE_PATHS,
} from './base.js';

import type { BaseProvider, ProviderFile } from './base.js';

export interface FSProviderOptions {
  path: string;
  ignorePaths?: Array<RegExp | string>;
}

export class FSProvider implements BaseProvider {
  opts;
  basePath;

  constructor(opts: FSProviderOptions) {
    this.opts = opts;
    this.basePath = opts.path;
  }

  async listDir(pathRelative: string): Promise<ProviderFile[]> {
    const files = await fs.readdir(path.join(this.basePath, pathRelative), {
      withFileTypes: true,
    });

    const list: ProviderFile[] = [];

    for (const file of files) {
      if (IGNORED_DIVE_PATHS.includes(file.name)) {
        continue;
      }
      if (IGNORED_DIVE_REGEX.find((reg) => reg.test(file.name))) {
        continue;
      }
      if (
        file.isFile() &&
        IGNORED_FILENAME_REGEX.find((reg) => reg.test(file.name))
      ) {
        continue;
      }

      list.push({
        name: file.name,
        type: file.isDirectory() ? 'dir' : 'file',
        fp: path.join(pathRelative, file.name),
      });
    }

    return list;
  }

  async open(pathRelative: string): Promise<string> {
    const content = await fs.readFile(pathRelative);

    return content.toString();
  }
}
