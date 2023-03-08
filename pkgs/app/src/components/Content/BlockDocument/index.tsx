import { LoadingOutlined } from '@ant-design/icons';
import { IconRepeat } from '@tabler/icons-react';
import type { ApiDocument, BlockDocument } from 'api/src/types/api';
import { useMemo } from 'react';

import { ContentDoc } from '..';
import { useGetDocument } from '../../../api/documents';
import { useProjectStore } from '../../../common/store';
import type { Payload } from '../helpers';

export const ContentBlockDocument: React.FC<{
  block: BlockDocument;
  pl: Payload;
  onRender?: (doc: ApiDocument) => void;
}> = ({ block, pl, onRender }) => {
  const storeProject = useProjectStore();

  const doc = useGetDocument({
    org_id: storeProject.project!.orgId,
    project_id: storeProject.project!.id,
    document_type: block.attrs.type,
    document_typeid: block.attrs.typeid,
  });

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

    pl.displayed.push(doc.data.data.id);
    return false;
  }, [doc.data]);

  if (doc.isLoading || !doc.data) {
    return (
      <div>
        <LoadingOutlined />
      </div>
    );
  }

  const data = doc.data.data;

  if (isCircular) {
    return (
      <div>
        <IconRepeat /> Go to <a href={`#${data.slug}`}>{data.name}</a>
      </div>
    );
  }

  return (
    <div id={data.slug}>
      <ContentDoc doc={data.content} pl={pl} />
    </div>
  );
};
