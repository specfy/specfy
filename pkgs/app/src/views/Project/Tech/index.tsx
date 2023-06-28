import { LoadingOutlined } from '@ant-design/icons';
import type { ComputedFlow } from '@specfy/api/src/common/flow/transform';
import { componentsToFlow } from '@specfy/api/src/common/flow/transform';
import type { ApiComponent, ApiProject } from '@specfy/api/src/types/api';
import { Tag } from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import type { TechInfo } from '../../../common/component';
import { supportedIndexed } from '../../../common/component';
import { useComponentsStore } from '../../../common/store';
import { titleSuffix } from '../../../common/string';
import { Card } from '../../../components/Card';
import { ComponentLine } from '../../../components/ComponentLine';
import { Container } from '../../../components/Container';
import { Flex } from '../../../components/Flex';
import { Flow, FlowWrapper } from '../../../components/Flow';
import { Toolbar } from '../../../components/Flow/Toolbar';
import { NotFound } from '../../../components/NotFound';
import type { RouteProject, RouteTech } from '../../../types/routes';

import cls from './index.module.scss';

export const Tech: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params, proj }) => {
  const route = useParams<Partial<RouteTech>>();
  const storeComponents = useComponentsStore();

  const [components, setComponents] = useState<ApiComponent[]>();
  const [flow, setFlow] = useState<ComputedFlow>();
  const [ready, setReady] = useState<boolean>(false);
  const [techname, setTechName] = useState<string>();
  const [usedBy, setUsedBy] = useState<ApiComponent[]>([]);
  const [info, setInfo] = useState<TechInfo>();
  const [Icon, setIcon] = useState<TechInfo['Icon']>();

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      setReady(true);
      return;
    }

    let name;
    console.log(supportedIndexed, route.tech_slug);
    if (route.tech_slug && route.tech_slug in supportedIndexed) {
      name = supportedIndexed[route.tech_slug].name;
      setInfo(supportedIndexed[route.tech_slug]);
      setIcon(supportedIndexed[route.tech_slug].Icon);
    } else {
      setInfo(undefined);
      setIcon(undefined);
    }

    const tmp = [];
    for (const comp of components) {
      if (!comp.tech) {
        continue;
      }

      for (const _tech of comp.tech) {
        if (_tech.toLocaleLowerCase() === route.tech_slug) {
          tmp.push(comp);
          if (!name) name = _tech;
        }
      }
    }

    if (name) {
      setTechName(name);
    }
    setReady(true);
    setUsedBy(tmp);
  }, [components]);

  useEffect(() => {
    if (!components) {
      return;
    }

    setFlow(componentsToFlow(components));
  }, [components]);

  if (!ready) {
    return <LoadingOutlined />;
  }
  if (!techname) {
    return <NotFound />;
  }

  return (
    <Container noPadding>
      <Helmet title={`${techname} - ${proj.name} ${titleSuffix}`} />
      <Container.Left2Third>
        <Card padded seamless large>
          <Flex justifyContent="space-between">
            <h2>
              {Icon && (
                <div className={cls.icon}>
                  <Icon size="1em" />
                </div>
              )}
              {techname}
            </h2>
            <Tag>{info ? info.type : 'tech'}</Tag>
          </Flex>

          <Title level={5}>Used in</Title>

          <ComponentLine title="Components" comps={usedBy} params={params} />
        </Card>
      </Container.Left2Third>
      <Container.Right1Third>
        <div>
          {flow && (
            <FlowWrapper style={{ height: '350px' }}>
              <Flow flow={flow} readonly />
              <Toolbar position="bottom">
                <Toolbar.Fullscreen project={proj} />
                <Toolbar.Zoom />
              </Toolbar>
            </FlowWrapper>
          )}
        </div>
      </Container.Right1Third>
    </Container>
  );
};
