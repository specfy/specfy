import { diffWordsWithSpace } from 'diff';
import { renderToString } from 'react-dom/server';

import { ContentDoc } from '../components/Content';
import type { ComputedForDiff } from '../components/DiffRow';
import type { TmpBlob } from '../hooks/useEdit';
import { isDiff } from '../hooks/useEdit';

export function diffTwoBlob(
  { type, typeId, blob }: Pick<TmpBlob, 'blob' | 'type' | 'typeId'>,
  original: Record<string, any> | null
) {
  const clean: TmpBlob = {
    type,
    typeId,
    original: original || {},
    blob: {} as any,
  };
  const computed: ComputedForDiff[] = [];

  for (const [key, value] of Object.entries(blob)) {
    if (original && !isDiff(original[key], value)) {
      continue;
    }

    if (key === 'description' || key === 'content') {
      clean.blob[key as keyof TmpBlob['blob']] = value;
      const a = original ? <ContentDoc doc={original[key]} /> : <></>;
      const b = <ContentDoc doc={value} />;
      const tmp: ComputedForDiff = {
        type,
        typeId,
        key,
        original,
        diff: diffWordsWithSpace(
          renderToString(a).replaceAll('<!-- -->', ''),
          renderToString(b).replaceAll('<!-- -->', '')
        ),
      };
      computed.push(tmp);
    } else if (Array.isArray(value)) {
      // TODO: Handle arrays
      continue;
    } else {
      const tmp: ComputedForDiff = {
        type,
        typeId,
        key,
        original,
        diff: diffWordsWithSpace(original ? original[key] : '', value),
      };
      computed.push(tmp);
    }
  }

  return { clean, computed };
}
