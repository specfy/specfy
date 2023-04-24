import { Skeleton } from 'antd';
import type { ApiOrg } from 'api/src/types/api';
import { useState, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { useListOrgs } from '../../api';
import { BigHeadingLoading } from '../../components/BigHeading';
import { Card } from '../../components/Card';
import { Container } from '../../components/Container';
import { NotFound } from '../../components/NotFound';
import { OrgHeader } from '../../components/Org/Header';
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
      <OrgHeader org={org} />

      <Container>
        <Routes>
          <Route path="/" element={<OrgOverview params={params} />} />
          <Route path="/content" element={<OrgContent params={params} />} />
          <Route path="/policies" element={<OrgPolicies params={params} />} />
          <Route path="/graph" element={<OrgGraph params={params} />} />
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
  );
};
