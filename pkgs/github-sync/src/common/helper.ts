import fs from 'node:fs/promises';

import type { Logger } from '@specfy/core';
import figures from 'figures';

export async function checkPaths({
  docEnabled,
  docPath,
  stackEnabled,
  stackPath,
  logger,
}: {
  docEnabled: boolean;
  docPath: string;
  stackEnabled: boolean;
  stackPath: string;
  logger: Logger;
}): Promise<boolean> {
  const l = logger;

  // Check repo path
  if (stackEnabled) {
    try {
      const stat = await fs.stat(stackPath);
      if (!stat.isDirectory()) {
        l.info(
          `${figures.cross} Path for stack "${stackPath}" is not a folder`
        );
        return false;
      }
    } catch (e) {
      l.info(`${figures.cross} Path for stack "${stackPath}" does not exist`);
      return false;
    }
  }

  // Check docs path
  if (docEnabled) {
    try {
      const stat = await fs.stat(docPath);
      if (!stat.isDirectory()) {
        l.info(
          `${figures.cross} Path for documentation "${docPath}" is not a folder`
        );
        return false;
      }
    } catch (e) {
      l.info(
        `${figures.cross} Path for documentation "${docPath}" does not exist`
      );
      return false;
    }
  }

  return true;
}

export function checkNothingMsg(logger: Logger) {
  logger.info('');
  logger.info(
    `${figures.warning} Nothing to do, did you mean to disable everything?`
  );
}
