import type {
  ApiBlobComponent,
  ApiComponent,
  FlowEdge,
  InComponent,
} from '@specfy/models';
import { IGNORED_COMPONENT_KEYS } from '@specfy/models/src/revisions/constants';
import type { Editor } from '@tiptap/react';
import { diffJson, diffWordsWithSpace } from 'diff';

import type {
  ComponentBlobWithDiff,
  ComponentDiffKeys,
} from '../../types/blobs';
import { getEmptyDoc } from '../content';

import { diffObjectsArray, diffStringArray } from './array';
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
    if (
      IGNORED_COMPONENT_KEYS.includes(k as keyof ApiBlobComponent['current'])
    ) {
      continue;
    }

    const key = k as ComponentDiffKeys;

    if (!blob.previous?.[key] && !blob.current[key]) {
      // no prev and no value
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
      // TODO: fix as any
      const change = diffObjectsArray<FlowEdge>(
        prev as any,
        value as any,
        'target',
        true
      );
      if (change.changes <= 0) {
        continue;
      }

      diffs.push({
        key,
        diff: change,
      });
      continue;
    }
    if (key === 'techs') {
      const prev = blob.previous?.[key] ? blob.previous[key] : [];
      const value = blob.current[key];
      // TODO: fix as any
      const change = diffObjectsArray<ApiComponent['techs'][0]>(
        prev as any,
        value as any,
        'id'
      );
      if (change.changes <= 0) {
        continue;
      }

      diffs.push({
        key,
        diff: change,
      });
      continue;
    }
    if (key === 'tags') {
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
      const change = diffJson(prev, value);
      if (change.length <= 1) {
        // When 1 it's the same json
        continue;
      }

      diffs.push({
        key,
        diff: change,
      });
      continue;
    }
    if (key === 'inComponent') {
      const value = blob.current[key];
      const prev: InComponent = blob.previous?.[key]
        ? blob.previous[key]
        : { id: null };
      if (value.id === prev!.id) {
        continue;
      }

      diffs.push({
        key,
        diff: 'modified',
      });
      continue;
    }
    if (key === 'show' || key === 'techId') {
      diffs.push({
        key,
        diff: 'modified',
      });
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
