import type { Editor } from '@tiptap/react';
import type { ApiBlobDocument } from 'api/src/types/api';
import { diffWordsWithSpace } from 'diff';

import type { DocumentBlobWithDiff } from '../../types/blobs';
import { getEmptyDoc } from '../content';

import { IGNORED_DOCUMENT_KEYS } from './constants';
import { isDiffSimple } from './helpers';
import { diffEditor } from './prosemirror';

export function diffDocument(
  editor: Editor,
  blob: ApiBlobDocument
): DocumentBlobWithDiff['diffs'] {
  const diffs: DocumentBlobWithDiff['diffs'] = [];

  if (blob.deleted || !blob.current) {
    return diffs;
  }

  for (const k of Object.keys(blob.current)) {
    if (IGNORED_DOCUMENT_KEYS.includes(k as any)) {
      continue;
    }

    const key = k as Exclude<
      keyof Exclude<ApiBlobDocument['current'], null>,
      (typeof IGNORED_DOCUMENT_KEYS)[number]
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

    if (key === 'content') {
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