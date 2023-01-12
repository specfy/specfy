import { Card, Col, Row } from 'antd';
import Title from 'antd/es/typography/Title';

import { ListProjects } from '../../components/ListProjects';
import { ListUpdates } from '../../components/ListUpdates';

import cls from './index.module.scss';

export const Home: React.FC = () => {
  return (
    <div className={cls.home}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={4}>Welcome, Samuel B.</Title>
        </Col>
        <Col span={18}>
          <Card size="small">
            <ListProjects></ListProjects>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <ListUpdates></ListUpdates>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
