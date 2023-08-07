import type { ApiProject } from '@specfy/api/src/types/api';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, Routes, useParams } from 'react-router-dom';

import { useListComponents, useGetProject, useListProjects } from '../../api';
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
import { ProjectHeader } from '../../components/Project/Header';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import type { RouteProject } from '../../types/routes';

import { ProjectActivity } from './Activity';
import { ComponentView } from './Component';
import { ProjectComponentCreate } from './Component/Create';
import { ProjectContentIndex } from './Content';
import { ProjectDeploysList } from './Deploy/List';
import { ProjectDeploysShow } from './Deploy/Show';
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
  const storeProject = useProjectStore();
  const storeComponents = useComponentsStore();
  const { current: org } = useOrgStore();

  // Data fetch
  const getProjects = useListProjects({ org_id: org?.id });
  const [proj, setProj] = useState<ApiProject>();
  const getProj = useGetProject({
    org_id: org?.id,
    project_slug: params.project_slug,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const getComps = useListComponents({
    org_id: params.org_id,
    project_id: proj?.id,
  });

  useEffect(() => {
    if (getProj.data) {
      setProj(getProj.data.data);
      storeProject.update(getProj.data.data);
    } else if (getProj.error) {
      setLoading(false);
    }
  }, [getProj.isFetching]);

  useEffect(() => {
    storeProject.fill(getProjects.data?.data || []);
  }, [getProjects.data]);

  useEffect(() => {
    if (getComps.data) {
      storeComponents.fill(getComps.data);
    }
  }, [getComps.data]);

  useEffect(() => {
    if (!loading || !proj) {
      return;
    }

    setCtx({ orgId: proj.orgId, projectId: proj.id });
    setLoading(getComps.isLoading || getProjects.isLoading);
  }, [loading, proj, getComps.data, getProjects.data]);

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
    return <NotFound />;
  }

  return (
    <div className={cls.project}>
      <Helmet title={`${proj.name} ${titleSuffix}`} />

      <div>
        <Sidebar org={org} project={proj}>
          <div className={cls.sidebarContent}>
            <ContentSidebar proj={proj} params={params} />
          </div>
        </Sidebar>
      </div>
      <div className={cls.main}>
        <div>
          <ProjectHeader proj={proj} params={params} />
        </div>
        <div className={cls.content}>
          <Routes>
            <Route path="/" element={<ProjectOverview params={params} />} />
            <Route
              path="/content/*"
              element={<ProjectContentIndex proj={proj} params={params} />}
            />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
