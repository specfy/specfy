import { Row, Col, Skeleton, Card } from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { useMount } from 'react-use';

import cls from './index.module.scss';

const tmp = {};

export const RFC: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<typeof tmp>();

  useMount(() => {
    setTimeout(() => {
      setLoading(false);
      setItem(tmp);
    }, 1000);
  });

  if (loading || !item) {
    return (
      <div className={cls.container}>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Skeleton active paragraph={false} className={cls.skeletonTitle} />
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className={cls.container}>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Title level={2}>{item.name}</Title>
          <Card></Card>
        </Col>
      </Row>
    </div>
  );
};
