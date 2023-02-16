import { LockOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

export const RFCStatusTag: React.FC<{ status: string; locked: boolean }> = ({
  status,
  locked,
}) => {
  if (status === 'approved')
    return <Tag color="success">{locked && <LockOutlined />}Approved</Tag>;
  else if (status === 'rejected')
    return <Tag color="red">{locked && <LockOutlined />}Rejected</Tag>;
  else return <Tag color="default">{locked && <LockOutlined />}Draft</Tag>;
};
