import type { ApiOrg } from '@specfy/api/src/types/api';
import { Skeleton } from 'antd';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, Routes, useParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { useListOrgs } from '../../api';
import { titleSuffix } from '../../common/string';
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
import cls from './index.module.scss';

export const Org: React.FC = () => {
  const params = useParams<Partial<RouteOrg>>() as RouteOrg;

  // Data
  const getOrgs = useListOrgs();
  const [org, setOrg] = useState<ApiOrg>();

  const [, setLastOrg] = useLocalStorage('lastOrg');

  useEffect(() => {
    if (getOrgs.data) {
      setOrg(getOrgs.data.data.find((o) => o.id === params.org_id));
    }
  }, [getOrgs.data, params.org_id]);

  useEffect(() => {
    if (org) {
      setLastOrg(org.id);
    }
  }, [org]);

  if (getOrgs.isLoading) {
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
      <Helmet title={`${org.name} ${titleSuffix}`} />
      <div>
        <Sidebar org={org} />
      </div>

      <div className={cls.main}>
        <div>
          <OrgHeader org={org} />
        </div>
        <Container noPadding className={cls.container}>
          <Routes>
            <Route
              path="/"
              element={<OrgOverview org={org} params={params} />}
            />
            <Route
              path="/content"
              element={<OrgContent org={org} params={params} />}
            />
            <Route
              path="/policies"
              element={<OrgPolicies org={org} params={params} />}
            />
            <Route
              path="/flow"
              element={<OrgFlow org={org} params={params} />}
            />
            <Route
              path="/activity"
              element={<OrgActivity org={org} params={params} />}
            />
            <Route
              path="/settings/*"
              element={<OrgSettings org={org} params={params} />}
            />
            <Route
              path="/project/new"
              element={<ProjectCreate org={org} params={params} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
      </div>
    </div>
  );
};
