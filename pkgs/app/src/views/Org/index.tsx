import type { ApiOrg } from '@specfy/models';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Route, Routes, useParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { useListOrgs } from '../../api';
import { titleSuffix } from '../../common/string';
import { Container } from '../../components/Container';
import { NotFound } from '../../components/NotFound';
import { OrgHeader } from '../../components/Org/Header';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import type { RouteOrg } from '../../types/routes';
import { ProjectCreate } from '../Project/Create';

import { OrgActivity } from './Activity';
import { OrgContent } from './Content';
import { OrgFlow } from './Flow';
import { OrgOverview } from './Overview';
import { OrgSettings } from './Settings';
import cls from './index.module.scss';

export const Org: React.FC = () => {
  const { setCtx } = useAuth();
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
      setCtx({ orgId: org.id });
    }
  }, [org]);

  if (getOrgs.isLoading || (org && params.org_id !== org?.id)) {
    return (
      <div className={cls.org}>
        <div></div>

        <div className={cls.main}>
          <div></div>

          <Container>
            <div>
              <Skeleton circle width={50} height={50} />
              <br />
              <Skeleton count={3} width={400} />
            </div>
          </Container>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className={cls.org}>
        <div className={cls.main}>
          <Container noPadding className={cls.container}>
            <NotFound />
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className={cls.org}>
      <Helmet title={`${org.name} ${titleSuffix}`} />
      <div>
        <Sidebar org={org} />
      </div>

      <div className={cls.main} key={params.org_id}>
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
