import { Card, Col, Row } from 'antd';
import Title from 'antd/es/typography/Title';

import { Container } from '../../components/Container';
import { ListActivity } from '../../components/ListActivity';
import { ListProjects } from '../../components/ListProjects';

export const Home: React.FC = () => {
  return (
    <Container>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={4}>Welcome, Samuel B.</Title>
        </Col>
        <Col span={16}>
          <Card>
            <ListProjects></ListProjects>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <ListActivity></ListActivity>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
