import { diffJson, diffWordsWithSpace } from 'diff';
import { renderToString } from 'react-dom/server';

import { ContentDoc } from '../components/Content';
import type { ComputedForDiff } from '../components/DiffRow';
import type { TmpBlob } from '../hooks/useEdit';
import { isDiff } from '../hooks/useEdit';

export function proposeTitle(computed: ComputedForDiff[]): string {
  if (computed.length === 0) {
    return '';
  } else if (computed.length === 1) {
    const item = computed[0];
    const type = item.type === 'project' ? 'project' : item.previous.name;
    return `fix(${type}): update ${item.key}`;
  } else {
    const types = new Set<ComputedForDiff['type']>();
    const names = new Set<string>();
    for (const change of computed) {
      types.add(change.type);
      names.add(change.previous.name);
    }

    if (types.size === 1) {
      if (names.size <= 3) {
        return `fix(${Array.from(types.values()).join(
          ''
        )}): update ${Array.from(names.values()).join(', ')}`;
      } else {
        return `fix(${Array.from(types.values()).join('')}): update many`;
      }
    }
  }

  return '';
}

export function diffTwoBlob(
  { type, typeId, blob }: Pick<TmpBlob, 'blob' | 'type' | 'typeId'>,
  previous: Record<string, any>
) {
  const clean: TmpBlob = {
    type,
    typeId,
    previous: previous || ({} as any),
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

    clean.blob[key as keyof TmpBlob['blob']] = value;

    if (key === 'description' || key === 'content') {
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
    } else if (value != null && typeof value == 'object') {
      console.log('coucou', key, value);

      const tmp: ComputedForDiff = {
        type,
        typeId,
        key,
        previous,
        diff: diffJson(previous ? previous[key] : '', value),
      };
      computed.push(tmp);
    } else {
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
