import { Avatar, Divider, Skeleton } from 'antd';
import type { ApiOrg, ApiProject } from 'api/src/types/api';
import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useListOrgs } from '../../api/orgs';
import { useGetProject, useListProjects } from '../../api/projects';
import { useComponentsStore, useProjectStore } from '../../common/store';
import { BigHeadingLoading } from '../../components/BigHeading';
import { Card } from '../../components/Card';
import { Container } from '../../components/Container';
import { NotFound } from '../../components/NotFound';
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
  const [org, setOrg] = useState<ApiOrg>();
  const getProjects = useListProjects({ org_id: org?.id });
  const [proj, setProj] = useState<ApiProject>();
  const getProj = useGetProject({
    org_id: org?.id,
    project_slug: params.project_slug,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const getComps = useListComponents(params.project_slug, {
    org_id: params.org_id,
    project_id: proj?.id,
  });

  useEffect(() => {
    if (getOrgs.data) {
      const tmp = getOrgs.data.find((o) => o.id === params.org_id);
      setOrg(tmp);
      if (!tmp) {
        setLoading(false);
      }
    }
  }, [getOrgs.data]);

  useEffect(() => {
    if (getProj.data) {
      setProj(getProj.data.data);
      storeProject.update(getProj.data.data);
    } else if (getProj.error) {
      setLoading(false);
    }
  }, [getProj.status]);

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
    setLoading(getComps.isLoading || getProjects.isLoading);
  }, [loading, proj, getComps.data, getProjects.data]);

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
    return <NotFound />;
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
