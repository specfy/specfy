import { Avatar, Breadcrumb, Card, Col, Row, Skeleton, Tag } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { supported } from '../../../common/component';
import { BigHeading } from '../../../components/BigHeading';
import { Container } from '../../../components/Container';
import type { RouteProject, RouteTech } from '../../../types/routes';
import { Line } from '../Component/Line';

export const Tech: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
  params: RouteProject;
}> = ({ proj, comps, params }) => {
  const route = useParams<Partial<RouteTech>>();

  const [techname, setTechName] = useState<string>();
  const [usedBy, setUsedBy] = useState<ApiComponent[]>([]);
  const [icon, setIcon] = useState<React.ReactNode>();

  useEffect(() => {
    setIcon(
      route.tech_slug! in supported ? (
        <Avatar
          icon={<i className={`devicon-${route.tech_slug}-plain colored`}></i>}
        />
      ) : undefined
    );

    let name;
    const tmp = [];
    for (const comp of comps) {
      if (!comp.tech) continue;

      for (const _tech of comp.tech) {
        if (_tech.toLocaleLowerCase() === route.tech_slug) {
          tmp.push(comp);
          if (!name) name = _tech;
        }
      }
    }

    if (name) setTechName(name);
    setUsedBy(tmp);
  }, [comps]);

  if (!techname) {
    return <div>not found</div>;
  }

  return (
    <Container>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <BigHeading
            title={techname}
            avatar={icon}
            subtitle={<Tag>tech</Tag>}
            breadcrumb={
              <Breadcrumb.Item>
                <Link to={`/org/${params.org_id}/${params.project_slug}`}>
                  Crawler
                </Link>
              </Breadcrumb.Item>
            }
          ></BigHeading>
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
