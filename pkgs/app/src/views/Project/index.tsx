import { Avatar, Divider, Skeleton } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useListOrgs } from '../../api/orgs';
import { useGetProject, useListProjects } from '../../api/projects';
import { useComponentsStore, useProjectStore } from '../../common/store';
import { BigHeadingLoading } from '../../components/BigHeading';
import { Card } from '../../components/Card';
import { Container } from '../../components/Container';
import { ProjectHeader } from '../../components/ProjectHeader';
import type { RouteProject } from '../../types/routes';

import { ProjectActivity } from './Activity';
import { ComponentView } from './Component';
import { ProjectComponentCreate } from './Component/Create';
import { ProjectContentIndex } from './Content';
import { ProjectGraph } from './Graph';
import { ProjectOverview } from './Overview';
import { ProjectRevisionCreate } from './Revisions/Create';
import { ProjectRevisionsList } from './Revisions/List';
import { ProjectRevisionsShow } from './Revisions/Show';
import { ProjectSettings } from './Settings';
import { Tech } from './Tech';
import cls from './index.module.scss';

export const Project: React.FC = () => {
  const tmpParams = useParams<Partial<RouteProject>>();
  const params = tmpParams as RouteProject;

  // Stores
  const storeProject = useProjectStore();
  const storeComponents = useComponentsStore();

  // Data fetch
  const getOrgs = useListOrgs();
  const getProjects = useListProjects({ org_id: params.org_id });
  const getProj = useGetProject(params);
  const [proj, setProj] = useState<ApiProject>();
  const [loading, setLoading] = useState<boolean>(true);
  const getComps = useListComponents(params.project_slug, {
    org_id: params.org_id,
    project_id: proj?.id,
  });

  useEffect(() => {
    storeProject.fill(getProjects.data?.data || []);
  }, [getProjects.isLoading]);

  useEffect(() => {
    setTimeout(() => {
      setProj(getProj.data?.data);
      if (getProj.data?.data) {
        storeProject.update(getProj.data.data);
      }
    }, 200);
  }, [getProj.isLoading]);

  useEffect(() => {
    if (getComps.data) {
      storeComponents.fill(getComps.data);
    }
  }, [getComps.isFetched]);

  useEffect(() => {
    setLoading(
      !proj || getComps.isLoading || getOrgs.isLoading || getProjects.isLoading
    );
  }, [proj, getComps]);

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
              <Divider />
              <Avatar.Group>
                <Skeleton.Avatar active />
                <Skeleton.Avatar active />
                <Skeleton.Avatar active />
              </Avatar.Group>
            </Card>
          </Container.Left>
        </Container>
      </div>
    );
  }

  if (!proj) {
    return <div>not found</div>;
  }

  return (
    <div>
      <div className={cls.header}>
        <ProjectHeader proj={proj} params={params} />
      </div>
      <Routes>
        <Route path="/" element={<ProjectOverview params={params} />} />
        <Route
          path="/content/*"
          element={<ProjectContentIndex proj={proj} params={params} />}
        />
        <Route
          path="/graph"
          element={<ProjectGraph proj={proj} params={params} />}
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
      </Routes>
    </div>
  );
};
