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

export function isDiffSimple(a: any, b: any): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
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

  // for (const [key, value] of Object.entries(blob.current)) {
  //   if (IGNORED.includes(key)) {
  //     continue;
  //   }
  //   if (
  //     blob.type === 'component' &&
  //     IGNORED_COMPONENT.includes(key as keyof ApiComponent)
  //   ) {
  //     continue;
  //   }
  //   if (
  //     blob.type === 'project' &&
  //     IGNORED_PROJECT.includes(key as keyof ApiProject)
  //   ) {
  //     continue;
  //   }

  //   const prev = blob.previous?.[key] ? blob.previous[key] : '';
  //   if (prev) {
  //     if (!prev && !value) {
  //       continue;
  //     }
  //     if (!isDiffSimple(prev, value)) {
  //       continue;
  //     }
  //   }

  //   if (!prev && !value) {
  //     continue;
  //   }

  //   if (key === 'description' || key === 'content') {
  //     clean.diffs.push({
  //       key,
  //       diff: diffEditor(
  //         editor.schema,
  //         prev ? JSON.parse(JSON.stringify(prev)) : getEmptyDoc(true),
  //         value ? JSON.parse(JSON.stringify(value)) : getEmptyDoc(true)
  //       ),
  //     });
  //     continue;
  //   }
  //   if (key === 'edges') {
  //     clean.diffs.push({
  //       key,
  //       diff: diffObjectsArray(prev || [], value || [], 'to'),
  //     });
  //     continue;
  //   }
  //   if (key === 'links') {
  //     clean.diffs.push({
  //       key,
  //       diff: diffObjectsArray(prev || [], value || [], 'url'),
  //     });
  //     continue;
  //   }
  //   if (key === 'tech') {
  //     clean.diffs.push({
  //       key,
  //       diff: diffStringArray(prev || [], value || []),
  //     });
  //     continue;
  //   }

  //   if ((value != null && typeof value == 'object') || Array.isArray(value)) {
  //     clean.diffs.push({
  //       key,
  //       diff: diffJson(prev, value),
  //     });
  //     continue;
  //   }

  //   clean.diffs.push({
  //     key,
  //     diff: diffWordsWithSpace(prev, `${value}`),
  //   });
  // }

  // return clean;
}
