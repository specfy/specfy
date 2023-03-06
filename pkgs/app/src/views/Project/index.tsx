import { IconCirclePlus } from '@tabler/icons-react';
import type { MenuProps } from 'antd';
import { Avatar, Button, Divider, Dropdown, Skeleton, Switch } from 'antd';
import type { ApiOrg, ApiProject } from 'api/src/types/api';
import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useListOrgs } from '../../api/orgs';
import { useGetProject } from '../../api/projects';
import { useComponentsStore, useProjectStore } from '../../common/store';
import { BigHeading, BigHeadingLoading } from '../../components/BigHeading';
import { Card } from '../../components/Card';
import { Container } from '../../components/Container';
import { ProjectMenu } from '../../components/ProjectMenu';
import { Staging } from '../../components/ProjectMenu/Staging';
import { Time } from '../../components/Time';
import { useEdit } from '../../hooks/useEdit';
import type { RouteProject } from '../../types/routes';

import { ProjectActivity } from './Activity';
import { ComponentView } from './Component';
import { ProjectContentList } from './Content/List';
import { RFC } from './Content/RFC';
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
  const linkOrg = useMemo(() => {
    return `/${params.org_id}`;
  }, [params]);
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/${params.project_slug}`;
  }, [params]);

  // Data fetch
  const getOrgs = useListOrgs();
  const [org, setOrg] = useState<ApiOrg>();
  const getProj = useGetProject(params);
  const [proj, setProj] = useState<ApiProject>();
  const [loading, setLoading] = useState<boolean>(true);
  const getComps = useListComponents(params.project_slug, {
    org_id: params.org_id,
    project_id: proj?.id,
  });
  const storeProject = useProjectStore();
  const storeComponents = useComponentsStore();

  // Edit mode
  const edit = useEdit();
  const isEditing = edit.isEnabled();
  const createItems = useMemo<MenuProps['items']>(() => {
    return [
      {
        key: '1',
        label: <Link to={`${linkSelf}/new/rfc`}>New RFC</Link>,
      },
      {
        key: '2',
        label: <Link to={`${linkSelf}/new/component`}>New Component</Link>,
      },
    ];
  }, [linkSelf]);

  useEffect(() => {
    setOrg(getOrgs.data?.find((o) => o.id === params.org_id));
  }, [getOrgs.isFetched]);
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
    setLoading(!proj || getComps.isLoading);
  }, [proj, getComps]);

  function handleEditMode(val: boolean) {
    edit.enable(val);
  }

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
    <div className={classnames(isEditing && cls.isEditing)}>
      <div className={cls.header}>
        <BigHeading
          parent={org!.name}
          parentLink={linkOrg}
          title={proj.name}
          link={linkSelf}
          subtitle={
            <>
              <div className={cls.editZone}>
                <div className={cls.editMode}>
                  <Switch
                    defaultChecked={false}
                    onChange={handleEditMode}
                    checked={isEditing}
                    size="small"
                  />
                  {isEditing ? (
                    <>
                      <Staging link={linkSelf} />
                      <Dropdown
                        menu={{ items: createItems }}
                        placement="bottomRight"
                      >
                        <Button icon={<IconCirclePlus />} type="text" />
                      </Dropdown>
                    </>
                  ) : (
                    'Edit'
                  )}
                </div>
                {!isEditing && (
                  <div>
                    updated <Time time={proj.updatedAt} />
                  </div>
                )}
              </div>
            </>
          }
        ></BigHeading>
        <ProjectMenu proj={proj} params={params} />

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
        <Routes>
          <Route path="/" element={<ProjectOverview params={params} />} />
          <Route
            path="/content"
            element={<ProjectContentList proj={proj} params={params} />}
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
            path="/rfc/:document_type_id/:document_slug"
            element={<RFC proj={proj} params={params} />}
          />
          <Route
            path="/c/:component_slug"
            element={<ComponentView proj={proj} params={params} />}
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
      </Container>
    </div>
  );
};
