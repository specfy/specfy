import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Typography,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';

import { Container } from '../../components/Container';

import cls from './index.module.scss';

export const ProjectCreate: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Container>
      <Row>
        <Col span={5}></Col>
        <Col span={12}>
          <Typography.Title level={3}>Create a new project</Typography.Title>
          <div className={cls.subtitle}>
            A project defines a new infrastructure inside your organisation.
          </div>
          <Card>
            <Form
              name="basic"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form.Item label="Organisation" name="org">
                    <Select
                      defaultValue="default"
                      size="large"
                      options={[
                        {
                          value: 'default',
                          label: "Samuel Bodin's org",
                        },
                        {
                          value: 'algolia',
                          label: 'Algolia',
                        },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={1}>
                  <div className={cls.slash}>/</div>
                </Col>
                <Col span={15}>
                  <Form.Item
                    label="Project Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: 'Please input a project name',
                      },
                    ]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Description" name="description">
                <TextArea rows={4} showCount maxLength={500} />
              </Form.Item>

              <Divider />

              <Button type="primary" htmlType="submit" size="large">
                Submit
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
