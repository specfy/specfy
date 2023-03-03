import { Col, Row } from 'antd';
import Title from 'antd/es/typography/Title';
import { useParams } from 'react-router-dom';

import { Card } from '../../components/Card';
import { Container } from '../../components/Container';
import { ListActivity } from '../../components/ListActivity';
import { ListProjects } from '../../components/ListProjects';
import type { RouteOrg } from '../../types/routes';

export const Home: React.FC = () => {
  const params = useParams<Partial<RouteOrg>>();

  return (
    <Container>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={4}>Welcome, Samuel B.</Title>
        </Col>
        <Col span={16}>
          <Card padded>
            <ListProjects></ListProjects>
          </Card>
        </Col>
        <Col span={8}>
          <Card padded>
            <ListActivity orgId={params.org_id!}></ListActivity>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
