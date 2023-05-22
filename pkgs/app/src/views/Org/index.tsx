import { Skeleton } from 'antd';
import type { ApiOrg } from 'api/src/types/api';
import { useState, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { useListOrgs } from '../../api';
import { Card } from '../../components/Card';
import { Container } from '../../components/Container';
import { NotFound } from '../../components/NotFound';
import { OrgHeader } from '../../components/Org/Header';
import { Sidebar } from '../../components/Sidebar';
import type { RouteOrg } from '../../types/routes';
import { ProjectCreate } from '../Project/Create';

import { OrgActivity } from './Activity';
import { OrgContent } from './Content';
import { OrgFlow } from './Flow';
import { OrgOverview } from './Overview';
import { OrgPolicies } from './Policies';
import { OrgSettings } from './Settings';
import { OrgTeam } from './Team';
import cls from './index.module.scss';

export const Org: React.FC = () => {
  const params = useParams<Partial<RouteOrg>>() as RouteOrg;

  // Data
  const getOrgs = useListOrgs();
  const [loading, setLoading] = useState<boolean>(true);
  const [org, setOrg] = useState<ApiOrg>();

  const [, setLastOrg] = useLocalStorage('lastOrg');

  useEffect(() => {
    if (getOrgs.data) {
      setOrg(getOrgs.data.data.find((o) => o.id === params.org_id));
      setLoading(false);
    } else {
      setLoading(getOrgs.isLoading);
    }
  }, [getOrgs.data, params.org_id]);

  useEffect(() => {
    if (org) {
      setLastOrg(org.id);
    }
  }, [org]);

  if (loading) {
    return (
      <div className={cls.org}>
        <div></div>

        <div className={cls.main}>
          <div></div>

          <Container>
            <Container.Left>
              <Card padded large seamless>
                <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
              </Card>
            </Container.Left>
          </Container>
        </div>
      </div>
    );
  }

  if (!org) {
    return <NotFound />;
  }

  return (
    <div className={cls.org}>
      <div>
        <Sidebar org={org} />
      </div>

      <div className={cls.main}>
        <div>
          <OrgHeader org={org} />
        </div>
        <Container noPadding className={cls.container}>
          <Routes>
            <Route path="/" element={<OrgOverview params={params} />} />
            <Route path="/content" element={<OrgContent params={params} />} />
            <Route path="/policies" element={<OrgPolicies params={params} />} />
            <Route path="/flow" element={<OrgFlow params={params} />} />
            <Route path="/team" element={<OrgTeam params={params} />} />
            <Route path="/activity" element={<OrgActivity params={params} />} />
            <Route
              path="/settings/*"
              element={<OrgSettings params={params} org={org} />}
            />
            <Route
              path="/project/new"
              element={<ProjectCreate params={params} />}
            />
          </Routes>
        </Container>
      </div>
    </div>
  );
};
