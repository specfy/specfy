import { LockOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

import cls from './index.module.scss';

export const RFCStatusTag: React.FC<{
  status: string;
  locked: boolean;
  merged?: boolean;
}> = ({ status, locked, merged }) => {
  if (merged) {
    return <Tag className={cls.merged}>{locked && <LockOutlined />}Merged</Tag>;
  }

  if (status === 'approved') {
    return (
      <Tag className={cls.approved}>{locked && <LockOutlined />}Approved</Tag>
    );
  } else if (status === 'rejected') {
    return (
      <Tag className={cls.rejected}>{locked && <LockOutlined />}Rejected</Tag>
    );
  } else if (status === 'waiting') {
    return (
      <Tag className={cls.waiting}>
        {locked && <LockOutlined />}Waiting Review
      </Tag>
    );
  } else if (status === 'closed') {
    return <Tag className={cls.closed}>{locked && <LockOutlined />}Closed</Tag>;
  } else {
    return <Tag className={cls.draft}>{locked && <LockOutlined />}Draft</Tag>;
  }
};
