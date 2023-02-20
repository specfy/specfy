import { LockOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export const RFCStatusTag: React.FC<{
  status: string;
  locked: boolean;
  merged?: boolean;
}> = ({ status, locked, merged }) => {
  if (merged) {
    return <Tag color="purple">{locked && <LockOutlined />}Merged</Tag>;
  }

  if (status === 'approved') {
    return <Tag color="success">{locked && <LockOutlined />}Approved</Tag>;
  } else if (status === 'rejected') {
    return <Tag color="red">{locked && <LockOutlined />}Rejected</Tag>;
  } else if (status === 'waiting') {
    return <Tag color="blue">{locked && <LockOutlined />}Waiting Review</Tag>;
  } else {
    return <Tag color="default">{locked && <LockOutlined />}Draft</Tag>;
  }
};
