import { flagRevisionApprovalEnabled } from '@specfy/api/src/models/revisions/constants';
import { IconLock } from '@tabler/icons-react';
import { Tag } from 'antd';

import cls from './index.module.scss';

export const StatusTag: React.FC<{
  status: string;
  locked: boolean;
  merged?: boolean;
}> = ({ status, locked, merged }) => {
  if (merged) {
    return <Tag className={cls.merged}>{locked && <IconLock />}Merged</Tag>;
  }

  if (status === 'approved') {
    return <Tag className={cls.approved}>{locked && <IconLock />}Approved</Tag>;
  } else if (status === 'waiting') {
    return (
      <Tag className={cls.waiting}>
        {locked && <IconLock />}Waiting{' '}
        {flagRevisionApprovalEnabled && 'Review'}
      </Tag>
    );
  } else if (status === 'closed') {
    return <Tag className={cls.closed}>{locked && <IconLock />}Closed</Tag>;
  } else {
    return <Tag className={cls.draft}>{locked && <IconLock />}Draft</Tag>;
  }
};
