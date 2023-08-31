import type {
  BlockLevelZero,
  ApiDocument,
  BlockDocument,
} from '@specfy/models';
import { IconRepeat } from '@tabler/icons-react';
import { useMemo } from 'react';

import { ContentDoc, Presentation } from '..';
import { useGetDocument } from '../../../api';
import { Loading } from '../../Loading';

import type { Payload } from '@/common/content';
import { useDocumentsStore, useProjectStore } from '@/common/store';

export const ContentBlockDocument: React.FC<{
  block: BlockDocument;
  pl: Payload;
  onRender?: (doc: ApiDocument) => void;
}> = ({ block, pl, onRender }) => {
  const storeProject = useProjectStore();
  const documentsStore = useDocumentsStore();

  const doc = useGetDocument({
    org_id: storeProject.project!.orgId,
    project_id: storeProject.project!.id,
    document_id: block.attrs.id,
  });

  const content = useMemo<BlockLevelZero>(() => {
    if (!doc.data) {
      return;
    }
    return JSON.parse(doc.data.data.content);
  }, [doc.data]);

  const isCircular = useMemo(() => {
    if (!doc.data) {
      return;
    }

    if (onRender) {
      onRender(doc.data.data);
    }

    if (pl.displayed.includes(doc.data.data.id)) {
      return true;
    }

    documentsStore.add([doc.data.data]);

    pl.displayed.push(doc.data.data.id);
    return false;
  }, [doc.data]);

  if (doc.isLoading || !doc.data) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  const data = doc.data.data;

  if (isCircular) {
    return (
      <div>
        <p>
          <IconRepeat /> Go to <a href={`#${data.slug}`}>{data.name}</a>
        </p>
      </div>
    );
  }

  return (
    <div id={data.slug}>
      <Presentation>
        <ContentDoc doc={content} pl={pl} />
      </Presentation>
    </div>
  );
};
