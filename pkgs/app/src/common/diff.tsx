import type { ApiBlobWithPrevious } from 'api/src/types/api';
import { diffJson, diffWordsWithSpace } from 'diff';
import { renderToString } from 'react-dom/server';

import { ContentDoc } from '../components/Content';
import type { BlobWithDiff } from '../components/DiffCard';

const IGNORED = ['id', 'createdAt', 'updatedAt', 'blobId'];
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

  for (const [key, value] of Object.entries(blob.blob)) {
    if (IGNORED.includes(key)) {
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
      const a = clean.previous ? (
        <ContentDoc doc={prev} noPlaceholder />
      ) : (
        <></>
      );
      const b = <ContentDoc doc={value} noPlaceholder />;
      clean.diffs.push({
        key,
        diff: diffWordsWithSpace(
          renderToString(a).replaceAll('<!-- -->', ''),
          renderToString(b).replaceAll('<!-- -->', '')
        ),
      });
    } else if (
      (value != null && typeof value == 'object') ||
      Array.isArray(value)
    ) {
      clean.diffs.push({
        key,
        diff: diffJson(prev, value),
      });
    } else {
      clean.diffs.push({
        key,
        diff: diffWordsWithSpace(prev, `${value}`),
      });
    }
  }

  return clean;
}
