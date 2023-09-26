import { IconMessageDots, IconSparkles } from '@tabler/icons-react';
import classNames from 'classnames';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';

import { useListDocuments } from '@/api';
import { db } from '@/common/db';
import { useComponentsStore, useProjectStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { Banner } from '@/components/Banner';
import { Container, ContainerChild } from '@/components/Container';
import { Button } from '@/components/Form/Button';
import { Subdued } from '@/components/Text';
import { Time } from '@/components/Time';

import { ProjectAssistantShow } from './Show';
import cls from './index.module.scss';

const History: React.FC = () => {
  const { project } = useProjectStore();
  const params = useParams();
  const items = useLiveQuery(
    () =>
      db.aiCompletion
        .where({ orgId: project!.orgId, projectId: project!.id })
        .reverse()
        .limit(14)
        .toArray(),
    [project]
  );

  return (
    <div className={cls.sidebar}>
      <h4>History</h4>
      <div className={cls.list}>
        {items?.map((item) => {
          return (
            <Link
              key={item.id}
              className={classNames(
                cls.prev,
                params.operationId === item.id && cls.current
              )}
              to={`./${item.id}`}
            >
              <Button>
                <IconMessageDots />
                {item.title}
              </Button>
              <Subdued>
                <Time time={item.createdAt} />
              </Subdued>
            </Link>
          );
        })}
        {(!items || items.length <= 0) && <Subdued>Nothing to show.</Subdued>}
      </div>
    </div>
  );
};

export const ProjectAssistant: React.FC = () => {
  const { project } = useProjectStore();
  const navigate = useNavigate();

  const storeComponents = useComponentsStore();
  const documents = useListDocuments({
    org_id: project!.orgId,
    project_id: project!.id,
  });

  const onGetOnboarding = async () => {
    const index = await db.aiCompletion.add({
      orgId: project!.orgId,
      projectId: project!.id,
      title: 'Customized onboarding',
      content: '',
      type: 'project.onboarding',
      createdAt: new Date().toISOString(),
      startedAt: null,
    });
    navigate(`./${index}`);
  };

  const hasEnough = useMemo<boolean>(() => {
    if (!storeComponents || !documents.data) {
      return true; // Avoid flickering during loading
    }
    return (
      Object.keys(storeComponents.components).length > 5 &&
      documents.data.data.length > 5
    );
  }, [storeComponents.components, documents]);

  if (!project) {
    return null;
  }

  return (
    <Container noPadding>
      <Helmet title={`Assistant - ${project.name} ${titleSuffix}`} />
      <ContainerChild leftLarge>
        <header className={cls.header}>
          <h1>
            <IconSparkles /> AI Assistant
          </h1>
        </header>
        <div className={cls.banner}>
          {!hasEnough && (
            <Banner>
              This project does not contain a lot of information, results may be
              incomplete
            </Banner>
          )}
        </div>
        <div className={cls.main}>
          <Routes>
            <Route path="/:operationId" element={<ProjectAssistantShow />} />
            <Route
              path="/"
              element={
                <div className={cls.blocs}>
                  <div className={cls.bloc} onClick={onGetOnboarding}>
                    <h3>Onboarding</h3>
                    <p>Get a customized onboarding</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </ContainerChild>
      <ContainerChild rightSmall>
        <History />
      </ContainerChild>
    </Container>
  );
};
