import type { ApiBlobComponent } from '@specfy/api/src/types/api';
import type { Editor } from '@tiptap/react';
import { diffJson, diffWordsWithSpace } from 'diff';

import type { ComponentBlobWithDiff } from '../../types/blobs';
import { getEmptyDoc } from '../content';

import { diffObjectsArray, diffStringArray } from './array';
import { IGNORED_COMPONENT_KEYS } from './constants';
import { isDiffSimple } from './helpers';
import { diffEditor } from './prosemirror';

export function diffComponent(
  editor: Editor,
  blob: ApiBlobComponent
): ComponentBlobWithDiff['diffs'] {
  const diffs: ComponentBlobWithDiff['diffs'] = [];

  if (blob.deleted || !blob.current) {
    return diffs;
  }

  for (const k of Object.keys(blob.current)) {
    if ((IGNORED_COMPONENT_KEYS as readonly string[]).includes(k)) {
      continue;
    }

    const key = k as Exclude<
      keyof Exclude<ApiBlobComponent['current'], null>,
      (typeof IGNORED_COMPONENT_KEYS)[number]
    >;

    // no prev and no value
    if (!blob.previous?.[key] && !blob.current[key]) {
      continue;
    }
    // no diff between prev and value
    if (
      blob.previous?.[key] &&
      !isDiffSimple(blob.previous[key], blob.current[key])
    ) {
      continue;
    }

    if (key === 'description') {
      const prev = blob.previous?.[key] ? blob.previous[key] : {};
      const value = blob.current[key];

      diffs.push({
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
      const prev = blob.previous?.[key] ? blob.previous[key] : [];
      const value = blob.current[key];

      diffs.push({
        key,
        diff: diffObjectsArray(prev, value, 'to'),
      });
      continue;
    }
    if (key === 'tech') {
      const prev = blob.previous?.[key] ? blob.previous[key] : [];
      const value = blob.current[key];

      diffs.push({
        key,
        diff: diffStringArray(prev, value),
      });
      continue;
    }
    if (key === 'display') {
      const value = blob.current[key];
      const prev = blob.previous?.[key] ? blob.previous[key] : {};

      diffs.push({
        key,
        diff: diffJson(prev, value),
      });
      continue;
    }

    // catch all string
    const value = blob.current[key];
    const prev = blob.previous?.[key] ? blob.previous[key] : '';
    diffs.push({
      key,
      diff: diffWordsWithSpace(prev || '', `${value}`),
    });
  }

  return diffs;
}
