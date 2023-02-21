import { diffWordsWithSpace } from 'diff';
import { renderToString } from 'react-dom/server';

import { ContentDoc } from '../components/Content';
import type { ComputedForDiff } from '../components/DiffRow';
import type { TmpBlob } from '../hooks/useEdit';
import { isDiff } from '../hooks/useEdit';

export function diffTwoBlob(
  { type, typeId, blob }: Pick<TmpBlob, 'blob' | 'type' | 'typeId'>,
  previous: Record<string, any> | null
) {
  const clean: TmpBlob = {
    type,
    typeId,
    previous: previous || {},
    blob: {} as any,
  };
  const computed: ComputedForDiff[] = [];

  for (const [key, value] of Object.entries(blob)) {
    if (previous) {
      if (!isDiff(previous[key], value)) {
        continue;
      }
      if (!previous[key] && !value) {
        continue;
      }
    }

    if (key === 'description' || key === 'content') {
      clean.blob[key as keyof TmpBlob['blob']] = value;
      const a = previous ? <ContentDoc doc={previous[key]} /> : <></>;
      const b = <ContentDoc doc={value} />;
      const tmp: ComputedForDiff = {
        type,
        typeId,
        key,
        previous,
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
      console.log('problematic', key, { previous: previous![key], value });
      const tmp: ComputedForDiff = {
        type,
        typeId,
        key,
        previous,
        diff: diffWordsWithSpace(previous ? previous[key] : '', value),
      };
      computed.push(tmp);
    }
  }

  return { clean, computed };
}
