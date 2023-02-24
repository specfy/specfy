import { Avatar, Card, Divider, Skeleton, Switch } from 'antd';
import type { ApiComponent, ApiOrg, ApiProject } from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListComponents } from '../../api/components';
import { useListOrgs } from '../../api/orgs';
import { useGetProject } from '../../api/projects';
import { BigHeading, BigHeadingLoading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import type { GraphRef } from '../../components/Graph';
import { Graph } from '../../components/Graph';
import { ProjectMenu } from '../../components/ProjectMenu';
import { Time } from '../../components/Time';
import { useCurrentRoute } from '../../hooks/useCurrentRoute';
import { useEdit } from '../../hooks/useEdit';
import type { RouteProject } from '../../types/routes';

import { ProjectActivity } from './Activity';
import { ComponentView } from './Component';
import { ProjectContentList } from './Content/List';
import { RFC } from './Content/RFC';
import { ProjectHome } from './Home';
import { ProjectRevisionCreate } from './Revisions/Create';
import { ProjectRevisionsList } from './Revisions/List';
import { ProjectRevisionsShow } from './Revisions/Show';
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
  const edit = useEdit();
  const [updateCount, setUpdateCount] = useState(0);
  useDebounce(
    () => {
      setUpdateCount(edit.getNumberOfChanges());
    },
    500,
    [edit.lastUpdate]
  );

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
    edit.enable(val);
  }

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
    <div className={classnames(edit.isEnabled() && cls.isEditing)}>
      <div className={cls.header}>
        <BigHeading
          parent={org!.name}
          parentLink={linkOrg}
          title={proj.name}
          link={linkSelf}
          subtitle={
            <>
              updated <Time time={proj.updatedAt} />
            </>
          }
        ></BigHeading>
        <ProjectMenu proj={proj} params={params} />
        <div className={cls.editZone}>
          <div className={cls.editMode}>
            {edit.isEnabled() ? (
              <Link to={`${linkSelf}/revisions/current`} className={cls.link}>
                {updateCount} {updateCount > 1 ? 'changes' : 'change'}
              </Link>
            ) : (
              'Edit'
            )}
            <Switch
              defaultChecked={false}
              onChange={handleEditMode}
              size="small"
            />
          </div>
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
                  <ProjectHome proj={proj} comps={comps} params={params} />
                }
              />
              <Route
                path="/content"
                element={<ProjectContentList proj={proj} params={params} />}
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

          <div className={cls.right}>
            <Graph components={comps} ref={graphRef}></Graph>
          </div>
        </div>
      </Container>
    </div>
  );
};
