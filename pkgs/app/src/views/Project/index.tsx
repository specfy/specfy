import {
  LinkOutlined,
  GithubOutlined,
  SlackOutlined,
  TeamOutlined,
  HomeOutlined,
  ReadOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Divider, Menu, Skeleton } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiOrg } from 'api/src/types/api/orgs';
import type { ApiProject } from 'api/src/types/api/projects';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useListOrgs } from '../../api/orgs';
import { useGetProject } from '../../api/projects';
import { BigHeading, BigHeadingLoading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import { Graph } from '../../components/Graph';
import { Time } from '../../components/Time';
import type { RouteProject } from '../../types/routes';

import { ProjectActivity } from './Activity';
import { ComponentView } from './Component';
import { ProjectContent } from './Content';
import { ProjectHome } from './Home';
import { RFC } from './RFC';
import { ProjectTeam } from './Team';
import { Tech } from './Tech';
import cls from './index.module.scss';

export const Project: React.FC = () => {
  const tmpParams = useParams<Partial<RouteProject>>();
  const params = tmpParams as RouteProject;
  const linkOrg = useMemo(() => {
    return `/org/${params.org_id}`;
  }, [params]);
  const linkSelf = useMemo(() => {
    return `/org/${params.org_id}/${params.project_slug}`;
  }, [params]);

  // Data fetch
  const getOrgs = useListOrgs();
  const [org, setOrg] = useState<ApiOrg>();
  const getProj = useGetProject(params);
  const [proj, setProj] = useState<ApiProject>();
  const getComps = useListComponents(params.project_slug, {
    org_id: params.org_id,
    project_id: proj?.id,
  });
  const [comps, setComps] = useState<ApiComponent[]>();

  useEffect(() => {
    setOrg(getOrgs.data?.find((o) => o.id === params.org_id));
  }, [getOrgs.isFetched]);
  useEffect(() => {
    setProj(getProj.data?.data);
  }, [getProj.isFetched]);
  useEffect(() => {
    setComps(getComps.data?.data);
  }, [getComps.isFetched]);

  const [menu] = useState(() => {
    return [
      {
        key: 'summary',
        label: (
          <Link to={linkSelf} className={cls.link}>
            <HomeOutlined />
            Summary
          </Link>
        ),
      },
      {
        key: 'Content',
        label: (
          <Link to={`${linkSelf}/content`} className={cls.link}>
            <ReadOutlined />
            Content
          </Link>
        ),
      },
      {
        key: 'activity',
        label: (
          <Link to={`${linkSelf}/activity`} className={cls.link}>
            <HistoryOutlined />
            Activity
          </Link>
        ),
      },
      {
        key: 'team',
        label: (
          <Link to={`${linkSelf}/team`} className={cls.link}>
            <TeamOutlined />
            Team
          </Link>
        ),
      },
    ];
  });

  if (getProj.isLoading || getComps.isLoading) {
    return (
      <Container className={cls.container}>
        <div className={cls.header}>
          <BigHeadingLoading />
        </div>
        <div className={cls.center}>
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

  if (!proj || !comps) {
    return <div>not found</div>;
  }

  return (
    <Container className={cls.container}>
      <div className={cls.header}>
        <BigHeading
          parent={org!.name}
          parentLink={linkOrg}
          title={proj.name}
          link={linkSelf}
          subtitle={<Time time={proj.updatedAt} />}
          actions={
            <div>
              <Button>Edit</Button>
            </div>
          }
        ></BigHeading>
      </div>
      <div className={cls.left}>
        <Menu defaultSelectedKeys={['content']} mode="inline" items={menu} />
        {proj.links.length > 0 && (
          <div className={cls.links}>
            {proj.links.map((link) => {
              let icon = <LinkOutlined />;
              if (link.title === 'Github') icon = <GithubOutlined />;
              else if (link.title === 'Slack') icon = <SlackOutlined />;
              return (
                <Link
                  key={link.link}
                  className={cls.link}
                  to={link.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {icon} {link.title}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <div className={cls.center}>
        <Routes>
          <Route
            path="/"
            element={<ProjectHome proj={proj} comps={comps} params={params} />}
          />
          <Route
            path="/content"
            element={<ProjectContent proj={proj} params={params} />}
          />
          <Route
            path="/activity"
            element={<ProjectActivity proj={proj} params={params} />}
          />
          <Route
            path="/team"
            element={<ProjectTeam proj={proj} params={params} />}
          />
          <Route
            path="/t/:tech_slug"
            element={<Tech proj={proj} comps={comps} params={params} />}
          />
          <Route
            path="/rfc/:document_type_id/:document_slug"
            element={<RFC proj={proj} comps={comps} params={params} />}
          />
          <Route
            path="/c/:component_slug"
            element={
              <ComponentView proj={proj} comps={comps} params={params} />
            }
          />
        </Routes>
      </div>

      <div className={cls.right}>
        <Card bordered={false} size="small">
          <Graph components={comps}></Graph>
        </Card>
      </div>
    </Container>
  );
};
