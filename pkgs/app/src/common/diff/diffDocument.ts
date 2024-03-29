import { isDiffSimple } from '@specfy/core/src/diff';
import { IGNORED_DOCUMENT_KEYS } from '@specfy/models/src/revisions/constants';
import { diffWordsWithSpace } from 'diff';

import type { ApiBlobDocument } from '@specfy/models';

import { getEmptyDoc } from '../content';
import type { DocumentBlobWithDiff, DocumentDiffKeys } from '@/types/blobs';

import { diffEditor } from './prosemirror';

import type { Editor } from '@tiptap/react';

export function diffDocument(
  editor: Editor,
  blob: ApiBlobDocument
): DocumentBlobWithDiff['diffs'] {
  const diffs: DocumentBlobWithDiff['diffs'] = [];

  if (blob.deleted || !blob.current) {
    return diffs;
  }

  for (const k of Object.keys(blob.current)) {
    if (IGNORED_DOCUMENT_KEYS.includes(k as keyof ApiBlobDocument['current'])) {
      continue;
    }

    const key = k as DocumentDiffKeys;

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

    if (key === 'content') {
      const prev = blob.previous?.[key] ? blob.previous[key] : '';
      const value = blob.current[key];

      if (blob.current.format === 'pm') {
        diffs.push({
          key,
          diff: diffEditor(
            editor.schema,
            prev ? JSON.parse(prev) : getEmptyDoc(true),
            value ? JSON.parse(value) : getEmptyDoc(true)
          ),
        });
      } else {
        diffs.push({
          key,
          diff: diffWordsWithSpace(prev, value),
        });
      }
      continue;
    }

    // catch all string
    const value = blob.current[key];
    const prev = blob.previous?.[key] ? blob.previous[key] : '';
    diffs.push({
      key,
      diff: diffWordsWithSpace(prev || '', `${value || ''}`),
    });
  }

  return diffs;
}
