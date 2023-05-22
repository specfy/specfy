import { IconSettings, IconUsers } from '@tabler/icons-react';
import { Badge, Menu } from 'antd';
import type { ApiOrg } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import { useCountPerms } from '../../../api';
import { Container } from '../../../components/Container';
import type { RouteOrg } from '../../../types/routes';

import { SettingsGeneral } from './General';
import { SettingsTeam } from './Team';
import cls from './index.module.scss';

export const OrgSettings: React.FC<{ params: RouteOrg; org: ApiOrg }> = ({
  params,
  org,
}) => {
  const location = useLocation();

  const resCount = useCountPerms({ org_id: params.org_id });

  // Menu
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/_/settings`;
  }, [params]);
  const [open, setOpen] = useState<string>('');

  const menu = useMemo(() => {
    return [
      {
        key: 'general',
        label: (
          <Link to={linkSelf} className={cls.link}>
            <IconSettings />
            General
          </Link>
        ),
      },
      {
        key: 'team',
        label: (
          <Link to={`${linkSelf}/team`} className={cls.link}>
            <IconUsers />
            Team
            <Badge count={resCount.data?.data} showZero={false} />
          </Link>
        ),
      },
    ];
  }, [linkSelf]);

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
          <Route
            path="/"
            element={<SettingsGeneral params={params} org={org} />}
          />
          <Route path="/team" element={<SettingsTeam params={params} />} />
        </Routes>
      </div>
    </Container>
  );
};
