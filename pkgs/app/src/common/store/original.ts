import type { ApiBlobWithPrevious, ApiProject } from '@specfy/models';

import type { Allowed, BlobAndDiffs } from '../../types/blobs';

import { useComponentsStore } from './components';
import { useDocumentsStore } from './documents';
import { useProjectStore } from './projects';

export const originalStore: Allowed[] = [];

export function addOriginal(value: Allowed) {
  const exists = originalStore.findIndex((val) => {
    return val.id === value.id;
  });
  if (exists > -1) {
    originalStore[exists] = JSON.parse(JSON.stringify(value));
    return;
  }

  originalStore.push(JSON.parse(JSON.stringify(value)));
}

export function findOriginal<T extends Allowed>(id: string): T | undefined {
  return originalStore.find<T>((val): val is T => {
    return val.id === id;
  });
}

export function allowedType(item: Allowed): ApiBlobWithPrevious['type'] {
  if ('links' in item) {
    return 'project';
  } else if ('content' in item) {
    return 'document';
  }
  return 'component';
}

export function revertAll(diffs: BlobAndDiffs[]) {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  const project = useProjectStore.getState();
  const components = useComponentsStore.getState();
  const documents = useDocumentsStore.getState();
  /* eslint-enable @typescript-eslint/no-use-before-define */

  for (const diff of diffs) {
    if (diff.blob.type === 'project') {
      project.update(findOriginal<ApiProject>(diff.blob.typeId)!);
    } else if (diff.blob.type === 'component') {
      components.revert(diff.blob.typeId);
    } else if (diff.blob.type === 'document') {
      documents.revert(diff.blob.typeId);
    }
  }
}
