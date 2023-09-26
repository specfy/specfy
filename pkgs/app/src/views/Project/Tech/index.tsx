import { componentsToFlow } from '@specfy/models/src/flows/transform';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import type { ApiComponent, ApiProject } from '@specfy/models';

import { useComponentsStore, useFlowStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { supportedIndexed } from '@/common/techs';
import type { TechInfo } from '@/common/techs';
import { ComponentIcon } from '@/components/Component/Icon';
import { ComponentLine } from '@/components/Component/Line';
import { Container, ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { FlowOrg } from '@/components/Flow/FlowOrg';
import { Toolbar } from '@/components/Flow/Toolbar';
import { FlowWrapper } from '@/components/Flow/Wrapper';
import { Loading } from '@/components/Loading';
import { NotFound } from '@/components/NotFound';
import { Tag } from '@/components/Tag';
import type { RouteProject, RouteTech } from '@/types/routes';

import cls from './index.module.scss';

export const Tech: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ params, proj }) => {
  const route = useParams<Partial<RouteTech>>();
  const storeComponents = useComponentsStore();

  const [components, setComponents] = useState<ApiComponent[]>();
  const [ready, setReady] = useState<boolean>(false);
  const [techname, setTechName] = useState<string>();
  const [usedBy, setUsedBy] = useState<ApiComponent[]>([]);
  const [info, setInfo] = useState<TechInfo>();
  const storeFlow = useFlowStore();

  useEffect(() => {
    setComponents(Object.values(storeComponents.components));
  }, [storeComponents]);

  useEffect(() => {
    if (!components) {
      setReady(true);
      return;
    }

    // Determine if tech is an actual tech or a "random" string
    let name;
    if (route.tech_slug && route.tech_slug in supportedIndexed) {
      name = supportedIndexed[route.tech_slug].name;
      setInfo(supportedIndexed[route.tech_slug]);
    } else {
      setInfo(undefined);
    }

    // Find used by
    const tmp = [];
    for (const comp of components) {
      if (!comp.techs) {
        continue;
      }

      for (const _tech of comp.techs) {
        if (_tech.id.toLocaleLowerCase() === route.tech_slug) {
          tmp.push(comp);
          if (!name) {
            name = _tech.id;
          }
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

    storeFlow.setCurrent(proj.id, componentsToFlow(components));
    storeFlow.setMeta({ readOnly: true });
    storeFlow.setHighlight(null);
  }, [components]);

  if (!ready) {
    return <Loading />;
  }
  if (!techname) {
    return <NotFound />;
  }

  return (
    <Container noPadding>
      <Helmet title={`${techname} - ${proj.name} ${titleSuffix}`} />
      <ContainerChild leftLarge className={cls.main}>
        <Flex justify="space-between" className={cls.title}>
          <h2>
            <Flex gap="l">
              <ComponentIcon data={{ techId: route.tech_slug }} large noEmpty />
              {techname}
            </Flex>
          </h2>
          {info && <Tag variant="border">{info ? info.type : 'tech'}</Tag>}
        </Flex>

        <h3>Used in</h3>

        <ComponentLine title="Services" comps={usedBy} params={params} />
      </ContainerChild>
      <ContainerChild rightSmall>
        <FlowWrapper columnMode>
          <FlowOrg />
          <Toolbar bottom>
            <Toolbar.Fullscreen to={`${proj.orgId}/${proj.slug}`} />
            <Toolbar.Zoom />
          </Toolbar>
        </FlowWrapper>
      </ContainerChild>
    </Container>
  );
};
