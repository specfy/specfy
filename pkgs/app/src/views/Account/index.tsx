import { IconSettings } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import { Container } from '../../components/Container';
import { Flex } from '../../components/Flex';
import * as Menu from '../../components/Menu';

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
          <Link to="/account">
            <Flex gap="l">
              <IconSettings />
              General
            </Flex>
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
      <Menu.Menu orientation="vertical">
        <Menu.List>
          {menu.map((item) => {
            return (
              <Menu.Item key={item.key}>
                <Menu.Link asChild active={open === item.key}>
                  {item.label}
                </Menu.Link>
              </Menu.Item>
            );
          })}
        </Menu.List>
      </Menu.Menu>

      <Flex gap="2xl" column align="initial">
        <Routes>
          <Route path="/" element={<SettingsGeneral />} />
        </Routes>
      </Flex>
    </Container>
  );
};
