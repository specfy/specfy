import {
  DownOutlined,
  PlusCircleOutlined,
  BellOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Menu, Dropdown, Badge, Avatar, Layout } from 'antd';
import { Link } from 'react-router-dom';

import Logo from '../../static/logo.svg';
import Logo1 from '../../static/specfy1.svg';

import cls from './index.module.scss';

const menuItems: MenuProps['items'] = [
  {
    key: 'settings',
    label: <Link to="/settings">Settings</Link>,
  },
];

const createItems: MenuProps['items'] = [
  {
    key: '1',
    label: <Link to="">New RFC</Link>,
  },
  {
    key: '2',
    label: <Link to="">New Project</Link>,
  },
  {
    key: '3',
    label: <Link to="">New Organisation</Link>,
  },
];

export const LayoutHeader: React.FC = () => {
  return (
    <Layout.Header className={cls.header}>
      <Link className={cls.logo} to="/">
        <img src={Logo} />
        <img src={Logo1} />
      </Link>

      <div>
        <Button
          type="primary"
          icon={<DownOutlined />}
          className={cls.orgSelect}
        />
      </div>

      <div>
        <Menu
          className={cls.menu}
          items={menuItems}
          selectedKeys={['home']}
          mode="horizontal"
        ></Menu>
      </div>

      <div className={cls.right}>
        <div>
          <Dropdown menu={{ items: createItems }} placement="bottomRight">
            <Button icon={<PlusCircleOutlined />} type="text" />
          </Dropdown>
        </div>
        <div>
          <Badge count={1} size="small">
            <Button icon={<BellOutlined />} type="text" />
          </Badge>
        </div>
        <div>
          <Avatar
            shape="circle"
            icon={<UserOutlined />}
            className={cls.avatar}
          />
        </div>
      </div>
    </Layout.Header>
  );
};
