import { IconSettings } from '@tabler/icons-react';
import { Menu } from 'antd';
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
      <Menu selectedKeys={[open]} mode="vertical" items={menu} />

      <div className={cls.flex}>
        <Routes>
          <Route path="/" element={<SettingsGeneral />} />
        </Routes>
      </div>
    </Container>
  );
};
