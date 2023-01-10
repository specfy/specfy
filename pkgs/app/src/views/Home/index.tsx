import { Card, Col, Row } from 'antd';
import Title from 'antd/es/typography/Title';

import { ListProjects } from '../../components/ListProjects';

import cls from './index.module.scss';

export const Home: React.FC = () => {
  return (
    <div className={cls.home}>
      <Row>
        <Col span={24}>
          <Title level={4}>Welcome, Samuel B.</Title>
        </Col>
        <Col span={18}>
          <Card size="small">
            <ListProjects></ListProjects>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
