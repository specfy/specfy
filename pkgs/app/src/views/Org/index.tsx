import {
  IconHome,
  IconBolt,
  IconSettings,
  IconApps,
  IconUsers,
  IconSchool,
} from '@tabler/icons-react';
import { Badge, Menu, Skeleton } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiOrg } from 'api/src/types/api';
import { useState, useMemo, useEffect } from 'react';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';

import { useListOrgs } from '../../api/orgs';
import { BigHeadingLoading } from '../../components/BigHeading';
import { Card } from '../../components/Card';
import { Container } from '../../components/Container';
import { NotFound } from '../../components/NotFound';
import type { RouteOrg } from '../../types/routes';
import { ProjectCreate } from '../Project/Create';

import { OrgActivity } from './Activity';
import { OrgContent } from './Content';
import { OrgGraph } from './Graph';
import { OrgOverview } from './Overview';
import { OrgPolicies } from './Policies';
import { OrgSettings } from './Settings';
import { OrgTeam } from './Team';
import cls from './index.module.scss';

export const Org: React.FC = () => {
  const params = useParams<Partial<RouteOrg>>() as RouteOrg;
  const location = useLocation();

  const [selected, setSelected] = useState<string>('');
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/_`;
  }, [params]);

  // Data
  const getOrgs = useListOrgs();
  const [loading, setLoading] = useState<boolean>(true);
  const [org, setOrg] = useState<ApiOrg>();

  useEffect(() => {
    if (getOrgs.data) {
      setOrg(getOrgs.data.find((o) => o.id === params.org_id));
      setLoading(false);
    } else {
      setLoading(getOrgs.isLoading);
    }
  }, [getOrgs.data]);

  const menu = useMemo(() => {
    return [
      {
        key: 'home',
        label: (
          <Link to={linkSelf}>
            <span>
              <IconHome />
            </span>
            Home
          </Link>
        ),
      },
      // {
      //   key: 'content',
      //   label: (
      //     <Link to={`${linkSelf}/content`}>
      //       <span>
      //         <IconBook />
      //       </span>
      //       Content
      //     </Link>
      //   ),
      // },
      {
        key: 'graph',
        label: (
          <Link to={`${linkSelf}/graph`}>
            <span>
              <IconApps />
            </span>
            Graph
          </Link>
        ),
      },
      {
        key: 'policies',
        label: (
          <Link to={`${linkSelf}/policies`}>
            <span>
              <IconSchool />
            </span>
            Policies
          </Link>
        ),
      },
      {
        key: 'team',
        label: (
          <Link to={`${linkSelf}/team`}>
            <span>
              <IconUsers />
            </span>
            Team
            <Badge count={31} showZero={false} />
          </Link>
        ),
      },
      {
        key: 'activity',
        label: (
          <Link to={`${linkSelf}/activity`}>
            <span>
              <IconBolt />
            </span>
            Activity
          </Link>
        ),
      },
      {
        key: 'settings',
        label: (
          <Link to={`${linkSelf}/settings`}>
            <span>
              <IconSettings />
            </span>
            Settings
          </Link>
        ),
      },
    ];
  }, [linkSelf]);

  useEffect(() => {
    const path = location.pathname.split('/');
    if (path[3] === 'content') {
      setSelected('content');
    } else if (path[3] === 'graph') {
      setSelected('graph');
    } else if (path[3] === 'activity') {
      setSelected('activity');
    } else if (path[3] === 'settings') {
      setSelected('settings');
    } else if (path[3] === 'team') {
      setSelected('team');
    } else if (path[3] === 'policies') {
      setSelected('policies');
    } else {
      setSelected('home');
    }
  }, [location]);

  if (loading) {
    return (
      <div>
        <div className={cls.header}>
          <BigHeadingLoading />
        </div>

        <Container>
          <Container.Left>
            <Card padded>
              <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
            </Card>
          </Container.Left>
        </Container>
      </div>
    );
  }

  if (!org) {
    return <NotFound />;
  }

  return (
    <div className={cls.container}>
      <div className={cls.header}>
        <div className={cls.avatar}></div>
        <div className={cls.description}>
          <Title level={1}>{org!.name}</Title>

          <Menu
            selectedKeys={[selected]}
            mode="horizontal"
            items={menu}
            className={cls.menu}
          />
        </div>
      </div>

      <Container>
        <Routes>
          <Route path="/" element={<OrgOverview params={params} />} />
          <Route path="/content" element={<OrgContent params={params} />} />
          <Route path="/policies" element={<OrgPolicies params={params} />} />
          <Route path="/graph" element={<OrgGraph params={params} />} />
          <Route path="/team" element={<OrgTeam params={params} />} />
          <Route path="/activity" element={<OrgActivity params={params} />} />
          <Route path="/settings/*" element={<OrgSettings params={params} />} />
          <Route
            path="/project/new"
            element={<ProjectCreate params={params} />}
          />
        </Routes>
      </Container>
    </div>
  );
};
