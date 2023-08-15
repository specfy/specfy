import type { ApiBlobProject } from '@specfy/models';
import { IGNORED_PROJECT_KEYS } from '@specfy/models/src//revisions/constants';
import type { Editor } from '@tiptap/react';
import { diffWordsWithSpace } from 'diff';

import type { ProjectBlobWithDiff, ProjectDiffKeys } from '../../types/blobs';
import { getEmptyDoc } from '../content';

import { diffObjectsArray } from './array';
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
    if (IGNORED_PROJECT_KEYS.includes(k as keyof ApiBlobProject['current'])) {
      continue;
    }

    const key = k as ProjectDiffKeys;

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
    if (key === 'links') {
      const prev = blob.previous?.[key] ? blob.previous[key] : [];
      const value = blob.current[key];

      diffs.push({
        key,
        diff: diffObjectsArray(prev, value, 'url'),
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
