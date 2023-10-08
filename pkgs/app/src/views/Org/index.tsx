import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Route, Routes, useParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import type { ApiOrg } from '@specfy/models';

import { ProjectCreate } from '../Project/Create';
import { useListOrgs } from '@/api';
import { useOrgStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { Container } from '@/components/Container';
import { NotFound } from '@/components/NotFound';
import { OrgMenu, OrgSwitcher } from '@/components/Org/Header';
import * as Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import type { RouteOrg } from '@/types/routes';

<<<<<<< HEAD
import { OrgCatalog } from './Catalog';
=======
>>>>>>> main
import { OrgFlow } from './Flow';
import { OrgOverview } from './Overview';
import { OrgSettings } from './Settings';
import cls from './index.module.scss';

const Org: React.FC = () => {
  const { setCtx } = useAuth();
  const params = useParams<Partial<RouteOrg>>() as RouteOrg;

  // Data
  const storeOrg = useOrgStore();
  const getOrgs = useListOrgs();
  const [loading, setLoading] = useState<boolean>(true);
  const [org, setOrg] = useState<ApiOrg>();

  const [, setLastOrg] = useLocalStorage('lastOrg');

  useEffect(() => {
    if (!getOrgs.data) {
      return;
    }

    const tmp = getOrgs.data.data.find((o) => o.id === params.org_id);
    if (!tmp) {
      setLoading(false);
      return;
    }

    setOrg(tmp);
    storeOrg.setCurrent(tmp);
    setLoading(false);
  }, [getOrgs.data, params.org_id]);

  useEffect(() => {
    if (org) {
      setLastOrg(org.id);
      setCtx({ orgId: org.id });
    }
  }, [org]);

  if ((org && params.org_id !== org?.id) || loading) {
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
        <Sidebar.Sidebar>
          <Sidebar.Group switcher={<OrgSwitcher />} name="Org">
            <OrgMenu />
          </Sidebar.Group>
        </Sidebar.Sidebar>
      </div>

      <div className={cls.main} key={params.org_id}>
        <Container noPadding className={cls.container}>
          <Routes>
            <Route
              path="/"
              element={<OrgOverview org={org} params={params} />}
            />
            <Route
              path="/catalog"
              element={<OrgCatalog org={org} params={params} />}
            />
            <Route
              path="/flow"
              element={<OrgFlow org={org} params={params} />}
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

export default Org;
