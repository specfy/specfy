import {
  IconBell,
  IconCaretDown,
  IconHelp,
  IconLogout,
  IconPlus,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { Divider, Button, Dropdown, Badge } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useListOrgs } from '../../api';
import { logout } from '../../api/auth';
import { isError } from '../../api/helpers';
import { i18n } from '../../common/i18n';
import { useOrgStore } from '../../common/store';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import type { RouteOrg } from '../../types/routes';
import { AvatarAuto } from '../AvatarAuto';
import { Logo } from '../Logo';

import cls from './index.module.scss';

const userItems: MenuProps['items'] = [];

export const LayoutHeader: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const storeOrg = useOrgStore();

  const params = useParams<Partial<RouteOrg>>();
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

  const handleLogout = async () => {
    const res = await logout();
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    navigate(`/login`);
  };

  useEffect(() => {
    if (!orgsQuery.data) {
      return;
    }

    const data: MenuProps['items'] = orgsQuery.data.data.map((org) => {
      return {
        key: org.id,
        label: (
          <Link to="/" className={cls.org}>
            <AvatarAuto org={org} /> {org.name}
          </Link>
        ),
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

    storeOrg.fill(orgsQuery.data.data);
    setOrgs(data);
  }, [orgsQuery.data]);

  useEffect(() => {
    if (!orgsQuery.data || isError(orgsQuery.data)) {
      return;
    }

    for (const org of orgsQuery.data.data) {
      if (org.id === params.org_id) {
        setCurrent(org.id);
        storeOrg.setCurrent(org);
        return;
      }
    }
  }, [orgsQuery.data, params.org_id]);

  return (
    <div className={cls.header}>
      <Link to="/" className={cls.logo}>
        <Logo color="white" />
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

      <div></div>

      <div className={cls.right}>
        <div>
          <Badge count={0} size="small">
            <Button icon={<IconBell />} type="text" />
          </Badge>
        </div>
        <div>
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
                  <div>Settings</div>
                </Link>
                <Link to="/account/" className={cls.userDropdownItem}>
                  <IconHelp />
                  <div>Support</div>
                </Link>
                <Divider />
                <a onClick={handleLogout} className={cls.userDropdownItem}>
                  <IconLogout />
                  <div>Logout</div>
                </a>
              </div>
            )}
            placement="bottomRight"
          >
            <Button
              type="text"
              className={cls.avatar}
              icon={
                user?.avatarUrl ? <img src={user.avatarUrl} /> : <IconUser />
              }
            ></Button>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};
