import type { ApiOrg, ApiProject } from '@specfy/models';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, Routes, useParams } from 'react-router-dom';

import {
  useListComponents,
  useGetProject,
  useListProjects,
  useListOrgs,
} from '../../api';
import {
  useComponentsStore,
  useOrgStore,
  useProjectStore,
} from '../../common/store';
import { titleSuffix } from '../../common/string';
import { Container } from '../../components/Container';
import { ContentSidebar } from '../../components/Content/Sidebar';
import { Loading } from '../../components/Loading';
import { NotFound } from '../../components/NotFound';
import { OrgMenu, OrgSwitcher } from '../../components/Org/Header';
import { ProjectMenu, ProjectSwitcher } from '../../components/Project/Header';
import { Staging } from '../../components/Project/Header/Staging';
import * as Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import type { RouteProject } from '../../types/routes';

import { ProjectActivity } from './Activity';
import { ProjectAssistant } from './Assistant';
import { ComponentView } from './Component';
import { ProjectComponentCreate } from './Component/Create';
import { ProjectDeploysList } from './Deploy/List';
import { ProjectDeploysShow } from './Deploy/Show';
import { ProjectDocumentation } from './Documentation';
import { ProjectFlow } from './Flow';
import { ProjectOverview } from './Overview';
import { ProjectRevisionCreate } from './Revisions/Create';
import { ProjectRevisionsList } from './Revisions/List';
import { ProjectRevisionsShow } from './Revisions/Show';
import { ProjectSettings } from './Settings';
import { Tech } from './Tech';
import cls from './index.module.scss';

export const Project: React.FC = () => {
  const { setCtx } = useAuth();
  const tmpParams = useParams<Partial<RouteProject>>();
  const params = tmpParams as RouteProject;

  // Stores
  const storeOrg = useOrgStore();
  const storeProject = useProjectStore();
  const storeComponents = useComponentsStore();

  // Data fetch
  const getOrgs = useListOrgs();
  const [org, setOrg] = useState<ApiOrg>();
  const [proj, setProj] = useState<ApiProject>();
  const getProject = useGetProject({
    org_id: org?.id,
    project_slug: params.project_slug,
  });
  const getProjects = useListProjects({ org_id: org?.id });
  const [loading, setLoading] = useState<boolean>(true);
  const getComps = useListComponents({
    org_id: params.org_id,
    project_id: proj?.id,
  });

  useEffect(() => {
    if (!getOrgs.data) {
      return;
    }
    const tmp = getOrgs.data.data.find((o) => o.id === params.org_id);
    if (!tmp) {
      return;
    }
    setOrg(tmp);
    storeOrg.setCurrent(tmp);
  }, [getOrgs.data, params.org_id]);

  useEffect(() => {
    if (getProject.data) {
      setProj(getProject.data.data);
      storeProject.update(getProject.data.data);
    } else if (getProject.error) {
      setLoading(false);
    }
  }, [getProject.data, getProject.error]);

  useEffect(() => {
    storeProject.fill(getProjects.data?.data || []);
  }, [getProjects.data]);

  useEffect(() => {
    if (getComps.data) {
      storeComponents.fill(getComps.data);
    }
  }, [getComps.data]);

  useEffect(() => {
    if (!loading || !proj || !org) {
      return;
    }

    setLoading(getComps.isLoading || getProjects.isLoading);
  }, [loading, proj, getComps.data, getProjects.data]);
  useEffect(() => {
    if (!proj) {
      return;
    }
    setCtx({ orgId: proj.orgId, projectId: proj.id });
  }, [proj]);

  if (loading) {
    return (
      <div className={cls.project}>
        <div></div>
        <div className={cls.main}>
          <div></div>

          <Container>
            <Container.Left>
              <Loading />
            </Container.Left>
          </Container>
        </div>
      </div>
    );
  }

  if (!org || !proj) {
    return (
      <div className={cls.project}>
        <NotFound />
      </div>
    );
  }

  return (
    <div className={cls.project}>
      <Helmet title={`${proj.name} ${titleSuffix}`} />

      <div>
        <Sidebar.Sidebar>
          <Sidebar.Group switcher={<OrgSwitcher />}>
            <OrgMenu org={org} />
          </Sidebar.Group>
          <Sidebar.Group switcher={<ProjectSwitcher />}>
            <Staging showBadge />
            <ProjectMenu proj={proj} params={params} />
          </Sidebar.Group>

          <Sidebar.Group name={'Documentation'}>
            <ContentSidebar proj={proj} params={params} />
          </Sidebar.Group>
        </Sidebar.Sidebar>
      </div>
      <div className={cls.main}>
        <div className={cls.content}>
          <Routes>
            <Route path="/" element={<ProjectOverview params={params} />} />
            <Route
              path="/flow"
              element={<ProjectFlow proj={proj} params={params} />}
            />
            <Route
              path="/activity"
              element={<ProjectActivity proj={proj} params={params} />}
            />
            <Route
              path="/t/:tech_slug"
              element={<Tech proj={proj} params={params} />}
            />
            <Route
              path="/component/new"
              element={<ProjectComponentCreate params={params} />}
            />
            <Route
              path="/c/:component_slug"
              element={<ComponentView proj={proj} />}
            />
            <Route
              path="/settings/*"
              element={<ProjectSettings proj={proj} params={params} />}
            />
            <Route
              path="/revisions"
              element={<ProjectRevisionsList proj={proj} params={params} />}
            />
            <Route
              path="/revisions/current"
              element={<ProjectRevisionCreate proj={proj} params={params} />}
            />
            <Route
              path="/revisions/:revision_id"
              element={<ProjectRevisionsShow proj={proj} params={params} />}
            />
            <Route
              path="/deploys"
              element={<ProjectDeploysList proj={proj} params={params} />}
            />
            <Route
              path="/deploys/:job_id"
              element={<ProjectDeploysShow proj={proj} params={params} />}
            />
            <Route
              path="/doc/*"
              element={<ProjectDocumentation proj={proj} />}
            />
            <Route path="/assistant/*" element={<ProjectAssistant />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
