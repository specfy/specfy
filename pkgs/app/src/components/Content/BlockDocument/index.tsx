import { LoadingOutlined } from '@ant-design/icons';
import { IconCaretDown, IconCaretRight } from '@tabler/icons-react';
import type { BlockDocument } from 'api/src/types/api';
import classnames from 'classnames';
import { useState } from 'react';

import { ContentDoc } from '..';
import { useGetDocument } from '../../../api/documents';
import { useProjectStore } from '../../../common/store';

import cls from './index.module.scss';

export const ContentBlockDocument: React.FC<{ block: BlockDocument }> = ({
  block,
}) => {
  const storeProject = useProjectStore();

  const doc = useGetDocument({
    org_id: storeProject.project!.orgId,
    project_id: storeProject.project!.id,
    document_type: block.attrs.type,
    document_typeid: block.attrs.typeid,
  });
  const [open, setOpen] = useState(true);

  if (doc.isLoading || !doc.data) {
    return (
      <div className={cls.block}>
        <LoadingOutlined />
      </div>
    );
  }

  const data = doc.data.data;
  const handleKey: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.code !== 'Enter' && e.code !== 'Space') {
      return;
    }

    e.preventDefault();
    setOpen(!open);
  };

  return (
    <div className={cls.block}>
      <div
        className={cls.header}
        onClick={() => setOpen(!open)}
        onKeyUpCapture={handleKey}
        tabIndex={0}
        role="group"
      >
        {open ? <IconCaretDown /> : <IconCaretRight />}
        {data.name}
      </div>
      <div className={classnames(cls.content, !open && cls.close)}>
        <ContentDoc doc={data.content} />
      </div>
    </div>
  );
};
