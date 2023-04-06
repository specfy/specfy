import { Editor } from '@tiptap/react';
import type { ApiBlobWithPrevious } from 'api/src/types/api';

import { createEditorSchema } from '../../components/Editor/extensions';
import type { BlobAndDiffs } from '../../types/blobs';

import { diffComponent } from './diffComponent';
import { diffDocument } from './diffDocument';
import { diffProject } from './diffProject';

export function proposeTitle(computed: BlobAndDiffs[]): string {
  if (computed.length === 0) {
    return '';
  }

  if (computed.length === 1) {
    const { blob, diffs } = computed[0];
    const type = blob.type === 'project' ? 'project' : blob.current?.name;
    if (blob.deleted) {
      return `fix(${blob.type}): delete ${type}`;
    }
    if (blob.created) {
      return `feat(${blob.type}): create ${type}`;
    }

    const keys = diffs.map((diff) => diff.key);
    return `update(${type}): update ${keys.join(', ')}`;
  }

  const types = new Set<BlobAndDiffs['blob']['type']>();
  const names = new Set<string>();
  for (const change of computed) {
    types.add(change.blob.type);
    if (change.blob.previous) {
      names.add(change.blob.previous.name);
    }
  }

  if (types.size === 1) {
    if (names.size <= 3) {
      return `fix(${Array.from(types.values()).join('')}): update ${Array.from(
        names.values()
      ).join(', ')}`;
    } else {
      return `fix(${Array.from(types.values()).join('')}): update`;
    }
  }

  return '';
}

const editor = new Editor(createEditorSchema());

export function diffTwoBlob(blob: ApiBlobWithPrevious): BlobAndDiffs['diffs'] {
  if (blob.type === 'component') {
    return diffComponent(editor, blob);
  } else if (blob.type === 'document') {
    return diffDocument(editor, blob);
  } else {
    return diffProject(editor, blob);
  }
}
