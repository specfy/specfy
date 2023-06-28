import type { ApiBlobProject } from '@specfy/api/src/types/api';
import type { Editor } from '@tiptap/react';
import { diffJson, diffWordsWithSpace } from 'diff';

import type { ProjectBlobWithDiff } from '../../types/blobs';
import { getEmptyDoc } from '../content';

import { diffObjectsArray } from './array';
import { IGNORED_PROJECT_KEYS } from './constants';
import { isDiffSimple } from './helpers';
import { diffEditor } from './prosemirror';

export function diffProject(
  editor: Editor,
  blob: ApiBlobProject
): ProjectBlobWithDiff['diffs'] {
  const diffs: ProjectBlobWithDiff['diffs'] = [];

  if (blob.deleted || !blob.current) {
    return diffs;
  }

  for (const k of Object.keys(blob.current)) {
    if (IGNORED_PROJECT_KEYS.includes(k as any)) {
      continue;
    }

    const key = k as Exclude<
      keyof Exclude<ApiBlobProject['current'], null>,
      (typeof IGNORED_PROJECT_KEYS)[number]
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
    if (key === 'links') {
      const prev = blob.previous?.[key] ? blob.previous[key] : [];
      const value = blob.current[key];

      diffs.push({
        key,
        diff: diffObjectsArray(prev, value, 'url'),
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
