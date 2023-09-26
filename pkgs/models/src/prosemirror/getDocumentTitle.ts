import path from 'node:path';

import type { Documents } from '@specfy/db';

import { allowListFilename } from './constants.js';

import type { ParsedUpload } from './types.js';

/**
 * Determines the best title of a document,
 * since filenames are usually not as good a the main H1 of a document except for a few exceptions.
 */
export function getDocumentTitle(doc: ParsedUpload, _prev?: Documents): string {
  let name;

  // Remove the title in document since we will display it independently
  if (
    doc.content.content.length > 0 &&
    doc.content.content[0].type === 'heading' &&
    doc.content.content[0].content
  ) {
    name = doc.content.content[0].content[0].text;
    doc.content.content.shift();
  }

  // // If there was a title we keep it because it might be have been overide manually
  // // It can be problematic when github is the source of truth and user change the title in the markdown but not the path, it won't be reflected.
  // if (prev) name = prev.name;
  const basename = path.basename(doc.path);
  if (basename in allowListFilename) {
    name = allowListFilename[basename];
  } else if (!name) {
    name = path.basename(doc.path).replace('.md', '');
  }

  return name;
}
