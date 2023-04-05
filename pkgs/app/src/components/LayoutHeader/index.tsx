import {
  IconApps,
  IconBell,
  IconCaretDown,
  IconHelp,
  IconLogout,
  IconPlus,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { Divider, Button, Menu, Dropdown, Badge, Layout } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useListOrgs } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import Logo1 from '../../static/logo2.svg';
import type { RouteOrg } from '../../types/routes';

import cls from './index.module.scss';

const menuItems: MenuProps['items'] = [
  // {
  //   key: 'review',
  //   label: <Link to="/review">Review</Link>,
  // },
  // {
  //   key: 'settings',
  //   label: <Link to="/settings">Settings</Link>,
  // },
];

const userItems: MenuProps['items'] = [];

export const LayoutHeader: React.FC = () => {
  const params = useParams<Partial<RouteOrg>>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgsQuery = useListOrgs();
  const [orgs, setOrgs] = useState<MenuProps['items']>([]);
  const [current, setCurrent] = useState<string>();

  const handleNavigate = (item: Exclude<MenuProps['items'], undefined>[0]) => {
    navigate(`/${item!.key}`);
  };

  const handleCreate = () => {
    navigate('/organizations/new');
  };

  useEffect(() => {
    if (!orgsQuery.data) {
      return;
    }

    const data: MenuProps['items'] = orgsQuery.data.map((org) => {
      return {
        key: org.id,
        label: <Link to="/">{org.name}</Link>,
        onClick: handleNavigate,
      };
    });

    data.push(
      {
        type: 'divider',
      },
      {
        label: 'Create organization',
        key: '#create',
        icon: <IconPlus size="1em" />,
        onClick: handleCreate,
      }
    );

    setOrgs(data);
  }, [orgsQuery.data]);

  useEffect(() => {
    if (!orgsQuery.data) {
      return;
    }

    for (const org of orgsQuery.data!) {
      if (org!.id === params.org_id) {
        setCurrent(org.id);
        return;
      }
    }
  }, [orgsQuery.data, params.org_id]);

  return (
    <Layout.Header className={cls.header}>
      <Link className={cls.logo} to="/">
        <IconApps />
        <img src={Logo1} />
      </Link>

      <div>
        <Dropdown
          menu={{
            items: orgs,
            selectable: true,
            selectedKeys: current ? [current] : [],
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" icon={<IconCaretDown />} />
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
          <Badge count={0} size="small">
            <Button icon={<IconBell />} type="text" />
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
                  <IconSettings />
                  Settings
                </Link>
                <Link to="/account/" className={cls.userDropdownItem}>
                  <IconHelp />
                  Support
                </Link>
                <Divider />
                <Link to="/logout/" className={cls.userDropdownItem}>
                  <IconLogout />
                  Logout
                </Link>
              </div>
            )}
            placement="bottomRight"
          >
            <Button
              type="text"
              className={cls.avatar}
              icon={<IconUserCircle />}
            ></Button>
          </Dropdown>
        </div>
      </div>
    </Layout.Header>
  );
};
