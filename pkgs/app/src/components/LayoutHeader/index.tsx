import {
  PlusCircleOutlined,
  BellOutlined,
  UserOutlined,
  CaretDownFilled,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Divider, Button, Menu, Dropdown, Badge, Layout } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useListOrgs } from '../../api/orgs';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../../static/logo.svg';
import Logo1 from '../../static/specfy1.svg';

import cls from './index.module.scss';

const menuItems: MenuProps['items'] = [
  {
    key: 'review',
    label: <Link to="/review">Review</Link>,
  },
  {
    key: 'settings',
    label: <Link to="/settings">Settings</Link>,
  },
];

const createItems: MenuProps['items'] = [
  {
    key: '1',
    label: <Link to="/new/rfc">New RFC</Link>,
  },
  {
    key: '2',
    label: <Link to="/new/project">New Project</Link>,
  },
  {
    key: '3',
    label: <Link to="/new/org">New Organisation</Link>,
  },
];

const userItems: MenuProps['items'] = [];

export const LayoutHeader: React.FC = () => {
  const { user } = useAuth();
  const orgsQuery = useListOrgs();
  const [orgs, setOrgs] = useState<MenuProps['items']>();

  useEffect(() => {
    if (orgsQuery.isLoading) return;

    setOrgs(
      orgsQuery.data!.map((org) => {
        return {
          key: org.id,
          label: <Link to="/">{org.name}</Link>,
        };
      })
    );
  }, [orgsQuery.isLoading]);

  return (
    <Layout.Header className={cls.header}>
      <Link className={cls.logo} to="/">
        <img src={Logo} />
        <img src={Logo1} />
      </Link>

      <div>
        <Dropdown menu={{ items: orgs }} placement="bottomRight">
          <Button
            type="text"
            icon={<CaretDownFilled />}
            className={cls.orgSelect}
          />
        </Dropdown>
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
          <Divider type="vertical" />
          <Dropdown
            menu={{ items: userItems }}
            trigger={['click']}
            dropdownRender={() => (
              <div className={cls.userDropdown}>
                <div className={cls.userDropdownProfil}>
                  <div>{user!.name}</div>
                  <strong>{user!.email}</strong>
                </div>
                <Divider />
                <Link to="/account/" className={cls.userDropdownItem}>
                  <SettingOutlined />
                  Settings
                </Link>
                <Link to="/account/" className={cls.userDropdownItem}>
                  <QuestionCircleOutlined />
                  Support
                </Link>
                <Divider />
                <Link to="/logout/" className={cls.userDropdownItem}>
                  <LogoutOutlined />
                  Logout
                </Link>
              </div>
            )}
            placement="bottomRight"
          >
            <Button
              type="text"
              shape="default"
              className={cls.avatar}
              icon={<UserOutlined />}
            ></Button>
          </Dropdown>
        </div>
      </div>
    </Layout.Header>
  );
};
