import fs from 'node:fs/promises';

import figures from 'figures';

import type { Logger } from '@specfy/core';
import type { SyncConfigFull } from '@specfy/models';

export async function checkPaths({
  settings,
  logger,
}: {
  settings: SyncConfigFull;
  logger: Logger;
}): Promise<boolean> {
  const l = logger;

  // Check repo path
  if (settings.stack.enabled) {
    try {
      const stat = await fs.stat(settings.stack.path);
      if (!stat.isDirectory()) {
        l.info(
          `${figures.cross} Path for stack "${settings.stack.path}" is not a folder`
        );
        return false;
      }
    } catch (e) {
      l.info(
        `${figures.cross} Path for stack "${settings.stack.path}" does not exist`
      );
      return false;
    }
  }

  // Check docs path
  if (settings.documentation.enabled) {
    try {
      const stat = await fs.stat(settings.documentation.path);
      if (!stat.isDirectory()) {
        l.info(
          `${figures.cross} Path for documentation "${settings.documentation.path}" is not a folder`
        );
        return false;
      }
    } catch (e) {
      l.info(
        `${figures.cross} Path for documentation "${settings.documentation.path}" does not exist`
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
