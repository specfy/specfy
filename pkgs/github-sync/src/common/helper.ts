import fs from 'node:fs/promises';

import { l } from '@specfy/core';
import figures from 'figures';
import kleur from 'kleur';

export async function checkPaths(
  docPath: string,
  stackPath: string
): Promise<boolean> {
  // Check repo path
  try {
    const stat = await fs.stat(stackPath);
    if (!stat.isDirectory()) {
      l.log(
        kleur.bold().red(figures.cross),
        `Path "${stackPath}" is not a folder`
      );
      return false;
    }
  } catch (e) {
    l.log(
      kleur.bold().red(figures.cross),
      `Path "${stackPath}" does not exist`
    );
    return false;
  }

  // Check docs path
  try {
    const stat = await fs.stat(docPath);
    if (!stat.isDirectory()) {
      l.log(
        kleur.bold().red(figures.cross),
        `Path "${docPath}" is not a folder`
      );
      return false;
    }
  } catch (e) {
    l.log(kleur.bold().red(figures.cross), `Path "${docPath}" does not exist`);
    return false;
  }

  return true;
}

export function checkNothingMsg() {
  l.log('');
  l.log(
    kleur
      .bold()
      .cyan(
        `${figures.warning} Nothing to do, did you mean to disable everything?`
      )
  );
}
