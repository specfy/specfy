import {
  LinkOutlined,
  GithubOutlined,
  SlackOutlined,
  TeamOutlined,
  HomeOutlined,
  ReadOutlined,
  ClusterOutlined,
  ThunderboltOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Avatar, Card, Divider, Menu, Skeleton, Switch } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiOrg } from 'api/src/types/api/orgs';
import type { ApiProject } from 'api/src/types/api/projects';
import classnames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useListOrgs } from '../../api/orgs';
import { useGetProject } from '../../api/projects';
import { BigHeading, BigHeadingLoading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import type { GraphRef } from '../../components/Graph';
import { Graph } from '../../components/Graph';
import { Time } from '../../components/Time';
import { useCurrentRoute } from '../../hooks/useCurrentRoute';
import type { RouteProject } from '../../types/routes';

import { ProjectActivity } from './Activity';
import { ComponentView } from './Component';
import { ProjectContent } from './Content';
import { ProjectHome } from './Home';
import { RFC } from './RFC';
import { ProjectSettings } from './Settings';
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

  // Graph spec
  const [gridClass, setGridClass] = useState<string>();
  const currRoute = useCurrentRoute();
  const graphRef = useRef<GraphRef>(null);

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

  // Edit mode
  const [editMode, setEditMode] = useState<boolean>(false);

  useEffect(() => {
    setOrg(getOrgs.data?.find((o) => o.id === params.org_id));
  }, [getOrgs.isFetched]);
  useEffect(() => {
    setProj(getProj.data?.data);
  }, [getProj.isFetched]);
  useEffect(() => {
    setComps(getComps.data?.data);
  }, [getComps.isFetched]);
  useEffect(() => {
    const sub = currRoute.pathname.split('/')[4];
    const isComp = sub === 'c';
    if (isComp || sub === 't') {
      setGridClass(cls.largerRight);
    } else if (sub === 'graph') {
      setGridClass(cls.noCenter);
    } else if (sub === undefined) {
      setGridClass('');
    } else {
      setGridClass(cls.noRight);
    }

    if (!isComp) graphRef.current?.unHighlightCell(true);

    setTimeout(() => graphRef.current?.recenter(), 750);
  }, [currRoute]);

  function handleCompLoad(id: string) {
    // Todo: wait for graph to be ready somehow
    graphRef.current?.unHighlightCell();
    graphRef.current?.highlightCell(id);
  }

  function handleEditMode(val: boolean) {
    setEditMode(val);
  }

  const menu = useMemo(() => {
    return [
      {
        key: 'home',
        label: (
          <Link to={linkSelf} className={cls.link}>
            <HomeOutlined />
            Home
          </Link>
        ),
      },
      {
        key: 'content',
        label: (
          <Link to={`${linkSelf}/content`} className={cls.link}>
            <ReadOutlined />
            Content
          </Link>
        ),
      },
      {
        key: 'graph',
        label: (
          <Link to={`${linkSelf}/graph`} className={cls.link}>
            <ClusterOutlined />
            Graph
          </Link>
        ),
      },
      {
        key: 'activity',
        label: (
          <Link to={`${linkSelf}/activity`} className={cls.link}>
            <ThunderboltOutlined />
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
      {
        key: 'settings',
        label: (
          <Link to={`${linkSelf}/settings`} className={cls.link}>
            <SettingOutlined />
            Settings
          </Link>
        ),
      },
    ];
  }, [linkSelf, cls.link]);

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
    <div className={editMode ? cls.isEditing : undefined}>
      <div className={cls.header}>
        <BigHeading
          parent={org!.name}
          parentLink={linkOrg}
          title={proj.name}
          link={linkSelf}
          subtitle={<Time time={proj.updatedAt} />}
        ></BigHeading>
        <Menu
          defaultSelectedKeys={['summary']}
          mode="horizontal"
          items={menu}
          className={cls.menu}
        />
        <div className={cls.editMode}>
          Edit
          <Switch
            defaultChecked={false}
            onChange={handleEditMode}
            size="small"
          />
          {/* <Button type="text" >
            <EditFilled />
            Edit Mode
          </Button> */}
        </div>

        {/* {proj.links.length > 0 && (
            <div className={cls.links}>
              <Menu
                mode="inline"
                items={proj.links.map((link) => {
                  let icon = <LinkOutlined />;
                  if (link.title === 'Github') icon = <GithubOutlined />;
                  else if (link.title === 'Slack') icon = <SlackOutlined />;
                  return {
                    key: link.link,
                    label: (
                      <Link
                        className={cls.link}
                        to={link.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {icon} {link.title}
                      </Link>
                    ),
                  };
                })}
              />
            </div>
          )} */}
      </div>

      <Container>
        <div className={classnames(cls.container, gridClass)}>
          <div className={cls.center}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProjectHome
                    proj={proj}
                    comps={comps}
                    params={params}
                    editMode={editMode}
                  />
                }
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
                element={<RFC proj={proj} params={params} />}
              />
              <Route
                path="/c/:component_slug"
                element={
                  <ComponentView
                    proj={proj}
                    comps={comps}
                    params={params}
                    onLoad={handleCompLoad}
                  />
                }
              />
              <Route
                path="/settings"
                element={<ProjectSettings proj={proj} params={params} />}
              />
            </Routes>
          </div>

          <div className={cls.right}>
            <Graph components={comps} ref={graphRef}></Graph>
          </div>
        </div>
      </Container>
    </div>
  );
};
