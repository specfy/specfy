import { Editor } from '@tiptap/react';
import type { ApiBlobWithPrevious, ApiComponent } from 'api/src/types/api';
import { diffJson, diffWordsWithSpace } from 'diff';

import type { BlobWithDiff } from '../../components/DiffCard';
import { createEditorSchema } from '../../components/Editor';
import { getEmptyDoc } from '../content';

import { diffEditor } from './prosemirror';

const IGNORED = [
  'id',
  'createdAt',
  'updatedAt',
  'blobId',
  'orgId',
  'projectId',
];
const IGNORED_COMPONENT: Array<keyof ApiComponent> = [
  'orgId',
  'projectId',
  'type',
  'typeId',
];

export function proposeTitle(computed: BlobWithDiff[]): string {
  if (computed.length === 0) {
    return '';
  }

  if (computed.length === 1) {
    const item = computed[0];
    const type = item.type === 'project' ? 'project' : item.blob?.name;
    if (item.deleted) {
      return `fix(${type}): delete`;
    }

    const keys = item.diffs.map((diff) => diff.key);
    return `fix(${type}): update ${keys.join(', ')}`;
  }

  const types = new Set<BlobWithDiff['type']>();
  const names = new Set<string>();
  for (const change of computed) {
    types.add(change.type);
    if (change.previous) {
      names.add(change.previous.name);
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

export function diffTwoBlob(blob: ApiBlobWithPrevious): BlobWithDiff {
  const clean: BlobWithDiff = {
    ...blob,
    diffs: [],
  };

  if (blob.deleted || !blob.blob) {
    return clean;
  }

  const editor = new Editor(createEditorSchema({}));

  for (const [key, value] of Object.entries(blob.blob)) {
    if (IGNORED.includes(key)) {
      continue;
    }
    if (blob.type === 'component' && IGNORED_COMPONENT.includes(key)) {
      continue;
    }

    const prev = clean.previous?.[key] ? clean.previous[key] : '';
    if (prev) {
      if (!prev && !value) {
        continue;
      }
      if (!isDiffSimple(prev, value)) {
        continue;
      }
    }

    if (!prev && !value) {
      continue;
    }

    if (key === 'description' || key === 'content') {
      clean.diffs.push({
        key,
        diff: diffEditor(
          editor.schema,
          prev ? JSON.parse(JSON.stringify(prev)) : getEmptyDoc(true),
          value ? JSON.parse(JSON.stringify(value)) : getEmptyDoc(true)
        ),
      });
      continue;
    }
    if (key === 'edges') {
      clean.diffs.push({
        key,
        diff: diffEditor(
          editor.schema,
          prev ? JSON.parse(JSON.stringify(prev)) : getEmptyDoc(true),
          value ? JSON.parse(JSON.stringify(value)) : getEmptyDoc(true)
        ),
      });
      continue;
    }

    if ((value != null && typeof value == 'object') || Array.isArray(value)) {
      clean.diffs.push({
        key,
        diff: diffJson(prev, value),
      });
      continue;
    }

    clean.diffs.push({
      key,
      diff: diffWordsWithSpace(prev, `${value}`),
    });
  }

  return clean;
}
