import { Card, Input, Typography, Form } from 'antd';
import type { ApiProject } from 'api/src/types/api/projects';

import type { RouteProject } from '../../../../types/routes';

export const ProjectEditContent: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  return (
    <div>
      <Card>
        <Typography.Title level={4}>Content</Typography.Title>

        <Form name="basic" layout="vertical">
          <Form.Item label="Title" name="name">
            <Input defaultValue={proj.name} size="large" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea
              defaultValue={proj.description}
              size="middle"
              style={{ height: 200 }}
              maxLength={1000}
            />
          </Form.Item>
        </Form>
      </Card>
      <Card style={{ marginTop: '32px' }}>
        <Typography.Title level={4}>Links</Typography.Title>
        {proj.links.map((link) => {
          return <div key={link.link}>{link.title}</div>;
        })}
      </Card>
    </div>
  );
};
