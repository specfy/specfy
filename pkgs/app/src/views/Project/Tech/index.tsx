import { Card, Col, Row, Tag, Typography } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { TechInfo } from '../../../common/component';
import { supported } from '../../../common/component';
import type { RouteTech } from '../../../types/routes';
import { Line } from '../Component/Line';

import cls from './index.module.scss';

export const Tech: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
  params: RouteTech;
}> = ({ comps, params }) => {
  const route = useParams<Partial<RouteTech>>();

  const [techname, setTechName] = useState<string>();
  const [usedBy, setUsedBy] = useState<ApiComponent[]>([]);
  const [info, setInfo] = useState<TechInfo>();
  const [Icon, setIcon] = useState<TechInfo['Icon']>();

  useEffect(() => {
    if (route.tech_slug && route.tech_slug in supported) {
      setInfo(supported[route.tech_slug]);
      setIcon(supported[route.tech_slug].Icon);
    } else {
      setInfo(undefined);
      setIcon(undefined);
    }

    let name;
    const tmp = [];
    for (const comp of comps) {
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

    if (name) setTechName(name);
    setUsedBy(tmp);
  }, [comps]);

  if (!techname) {
    return <div>not found</div>;
  }

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card>
          <Typography.Title level={2}>
            {Icon && (
              <div className={cls.icon}>
                <Icon size="1em" />
              </div>
            )}
            {techname}
            {info ? <Tag>{info.type}</Tag> : <Tag>tech</Tag>}
          </Typography.Title>

          <Title level={5}>Used in</Title>

          <Line title="Components" comps={usedBy} params={params} />
        </Card>
      </Col>
    </Row>
  );
};
