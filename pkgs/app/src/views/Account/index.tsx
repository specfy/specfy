import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { IconSettings } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import { Container } from '../../components/Container';

import { SettingsGeneral } from './General';
import cls from './index.module.scss';

export const Account: React.FC = () => {
  const location = useLocation();

  // Menu
  const [open, setOpen] = useState<string>('');

  const menu = useMemo(() => {
    return [
      {
        key: 'general',
        label: (
          <Link to="/account" className={cls.link}>
            <IconSettings />
            General
          </Link>
        ),
      },
    ];
  }, []);

  useEffect(() => {
    if (location.pathname.match(/team/)) {
      setOpen('team');
    } else {
      setOpen('general');
    }
  }, [location]);

  return (
    <Container className={cls.container}>
      <NavigationMenu.Root orientation="vertical" className="rx_navMenuRoot">
        <NavigationMenu.List className="rx_navMenuList">
          {menu.map((item) => {
            return (
              <NavigationMenu.Item className="rx_navMenuItem" key={item.key}>
                <NavigationMenu.Link
                  asChild
                  className="rx_navMenuLink"
                  active={open === item.key}
                >
                  {item.label}
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <div className={cls.flex}>
        <Routes>
          <Route path="/" element={<SettingsGeneral />} />
        </Routes>
      </div>
    </Container>
  );
};
