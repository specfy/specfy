import {
  IconChevronLeft,
  IconChevronRight,
  IconHelp,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';
import classNames from 'classnames';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { isError } from '../../api/helpers';
import { i18n } from '../../common/i18n';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { AvatarAuto } from '../AvatarAuto';
import * as Dropdown from '../Dropdown';
import { Flex } from '../Flex';
import { Button } from '../Form/Button';
import { Logo } from '../Logo';
import { Subdued } from '../Text';

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
        <Dropdown.Portal>
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

              <Dropdown.Item asChild>
                <Link to="/account/">
                  <IconHelp />
                  <div>Support</div>
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
        </Dropdown.Portal>
      </Dropdown.Menu>
    </div>
  );
};

export * from './Block';
export * from './Group';

export const Sidebar: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [collapse, setCollapse] = useState<boolean>(false);

  const onCollapse = () => {
    setCollapse(!collapse);
  };

  return (
    <div className={cls.wrapper}>
      <div className={classNames(cls.collapser, collapse && cls.collapsed)}>
        <Button size="s" display="ghost" onClick={onCollapse}>
          {collapse ? <IconChevronRight /> : <IconChevronLeft />}
        </Button>
      </div>
      <div className={classNames(cls.sidebar, collapse && cls.collapsed)}>
        <div className={cls.inner}>
          <header className={cls.header}>
            <Flex justify="space-between">
              <Link to="/" className={cls.logo}>
                <Logo />
                <div className={cls.beta}>beta</div>
              </Link>
              <User />
            </Flex>
          </header>
          <div className={cls.content}>{children}</div>
        </div>
      </div>
    </div>
  );
};
