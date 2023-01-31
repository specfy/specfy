import { Avatar, Breadcrumb, Card, Col, Row, Skeleton, Tag } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { useGetProject } from '../../api/projects';
import { supported } from '../../common/component';
import { BigHeading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import type { RouteTech } from '../../types/routes';
import { Line } from '../Component/Line';

export const Tech: React.FC = () => {
  const tmpParams = useParams<Partial<RouteTech>>();
  const params = tmpParams as RouteTech;

  const [proj, setProj] = useState<ApiProject>();
  const [techName, setTechName] = useState<string>();
  const [usedBy, setUsedBy] = useState<ApiComponent[]>([]);
  const [icon, setIcon] = useState<React.ReactNode>();

  // Data fetch
  const res = useGetProject(params);
  const comps = useListComponents(params.project_slug, {
    org_id: params.org_id,
    project_id: proj?.id,
  });

  useEffect(() => {
    setProj(res.data?.data);
  }, [res.isLoading]);
  useEffect(() => {
    if (!comps.data?.data) {
      return;
    }

    setIcon(
      params.tech_slug in supported ? (
        <Avatar
          icon={<i className={`devicon-${params.tech_slug}-plain colored`}></i>}
        />
      ) : undefined
    );

    let name;
    const tmp = [];
    for (const comp of comps.data!.data) {
      if (!comp.tech) continue;

      for (const _tech of comp.tech) {
        if (_tech.toLocaleLowerCase() === params.tech_slug) {
          tmp.push(comp);
          if (!name) name = _tech;
        }
      }
    }

    if (name) setTechName(name);
    setUsedBy(tmp);
  }, [comps.isLoading]);

  if (res.isLoading || comps.isLoading) {
    return (
      <Container>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Skeleton active paragraph={false} />
          </Col>
          <Col span={18}>
            <Card>
              <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/org/${params.org_id}/${params.project_slug}`}>
                Crawler
              </Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <BigHeading title={params.tech_slug} avatar={icon}>
            <Tag>{techName}</Tag>
          </BigHeading>
        </Col>
        <Col span={18}>
          <Card>
            <Title level={5}>Used in</Title>

            <Line title="Components" list={usedBy} params={params} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
