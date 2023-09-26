import { IconLogout, IconSettings } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

import { Logo } from '../../Logo';
import { isError } from '@/api/helpers';
import { i18n } from '@/common/i18n';
import { AvatarAuto } from '@/components/AvatarAuto';
import * as Dropdown from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import { Subdued } from '@/components/Text';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

import cls from './index.module.scss';

const User: React.FC = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await logout();
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    navigate(`/login`);
  };

  return (
    <div>
      <Dropdown.Menu>
        <Dropdown.Trigger asChild>
          <button>
            <AvatarAuto user={user!} />
          </button>
        </Dropdown.Trigger>
        <Dropdown.Content>
          <div className={cls.userDropdown}>
            <strong>{user!.name}</strong>
            <Subdued>{user!.email}</Subdued>
          </div>

          <Dropdown.Separator />
          <Dropdown.Group>
            <Dropdown.Item asChild>
              <Link to="/account/">
                <IconSettings />
                <div>Settings</div>
              </Link>
            </Dropdown.Item>
          </Dropdown.Group>

          <Dropdown.Separator />

          <Dropdown.Group>
            <Dropdown.Item asChild>
              <button onClick={handleLogout}>
                <IconLogout />
                <div>Logout</div>
              </button>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Menu>
    </div>
  );
};

export const Header: React.FC = () => {
  return (
    <header className={cls.header}>
      <Flex justify="space-between">
        <Link to="/">
          <Logo className={cls.logo} />
          <div className={cls.beta}>beta</div>
        </Link>
        <User />
      </Flex>
    </header>
  );
};
