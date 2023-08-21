import type { ApiBlobWithPrevious, ApiProject } from '@specfy/models';

import type { Allowed, BlobAndDiffs } from '../../types/blobs';

import { useComponentsStore } from './components';
import { useDocumentsStore } from './documents';
import { useProjectStore } from './projects';

export const original = {
  store: [] as Allowed[],
  add,
  find,
  cleanProject,
  allowedType,
  revertAll,
};

function add(value: Allowed) {
  const exists = original.store.findIndex((val) => {
    return val.id === value.id;
  });
  if (exists > -1) {
    original.store[exists] = JSON.parse(JSON.stringify(value));
    return;
  }

  original.store.push(JSON.parse(JSON.stringify(value)));
}

function find<T extends Allowed>(id: string): T | undefined {
  return original.store.find<T>((val): val is T => {
    return val.id === id;
  });
}

function cleanProject<T extends Allowed>(projectId: string): void {
  original.store = original.store.filter<T>((val): val is T => {
    return 'projectId' in val ? val.projectId !== projectId : true;
  });
}

function allowedType(item: Allowed): ApiBlobWithPrevious['type'] {
  if ('links' in item) {
    return 'project';
  } else if ('content' in item) {
    return 'document';
  }
  return 'component';
}

function revertAll(diffs: BlobAndDiffs[]) {
  /* eslint-disable @typescript-eslint/no-use-before-define */
  const project = useProjectStore.getState();
  const components = useComponentsStore.getState();
  const documents = useDocumentsStore.getState();
  /* eslint-enable @typescript-eslint/no-use-before-define */

  for (const diff of diffs) {
    if (diff.blob.type === 'project') {
      project.update(find<ApiProject>(diff.blob.typeId)!);
    } else if (diff.blob.type === 'component') {
      components.revert(diff.blob.typeId);
    } else if (diff.blob.type === 'document') {
      documents.revert(diff.blob.typeId);
    }
  }
}
