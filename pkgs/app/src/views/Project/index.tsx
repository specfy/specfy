import { Avatar, Card, Divider, Skeleton } from 'antd';
import { Route, Routes, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useGetProject } from '../../api/projects';
import { BigHeadingLoading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import type { RouteProject } from '../../types/routes';

import { ComponentView } from './Component';
import { ProjectEdit } from './Edit';
import { ProjectHome } from './Home';
import cls from './Home/index.module.scss';
import { RFC } from './RFC';
import { Tech } from './Tech';

export const Project: React.FC = () => {
  const tmpParams = useParams<Partial<RouteProject>>();
  const params = tmpParams as RouteProject;

  // Data fetch
  const proj = useGetProject(params);
  const comps = useListComponents(params.project_slug, {
    org_id: params.org_id,
    project_id: proj?.data?.data.id,
  });

  if (proj.isLoading || comps.isLoading) {
    return (
      <Container className={cls.container}>
        <div className={cls.left}>
          <div className={cls.header}>
            <BigHeadingLoading />
          </div>
          <Card>
            <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
            <Divider />
            <Avatar.Group>
              <Skeleton.Avatar active />
              <Skeleton.Avatar active />
              <Skeleton.Avatar active />
            </Avatar.Group>
          </Card>
        </div>

        <div className={cls.right}></div>
      </Container>
    );
  }

  if (!proj.data || !comps.data) {
    return <div>not found</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProjectHome
            proj={proj.data.data}
            comps={comps.data.data}
            params={params}
          />
        }
      />
      <Route
        path="/edit/*"
        element={<ProjectEdit proj={proj.data.data} params={params} />}
      />
      <Route
        path="/t/:tech_slug"
        element={
          <Tech proj={proj.data.data} comps={comps.data.data} params={params} />
        }
      />
      <Route
        path="/rfc/:document_type_id/:document_slug"
        element={
          <RFC proj={proj.data.data} comps={comps.data.data} params={params} />
        }
      />
      <Route
        path="/c/:component_slug"
        element={
          <ComponentView
            proj={proj.data.data}
            comps={comps.data.data}
            params={params}
          />
        }
      />
    </Routes>
  );
};
