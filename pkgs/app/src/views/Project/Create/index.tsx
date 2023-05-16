import { IconCircleArrowRight } from '@tabler/icons-react';
import { App, Button, Form, Input, Typography } from 'antd';
import type { FieldsErrors } from 'api/src/types/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createProject } from '../../../api';
import { isError, isValidationError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { useProjectStore } from '../../../common/store';
import { slugify } from '../../../common/string';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const ProjectCreate: React.FC<{ params: RouteOrg }> = ({ params }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const storeProjects = useProjectStore();

  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [errors, setErrors] = useState<FieldsErrors>({});

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Compute global bounding box
    const global = { x: 0, y: 0, width: 0, height: 0 };
    for (const proj of Object.values(storeProjects.projects)) {
      global.x = Math.min(proj.display.pos.x, global.x);
      global.y = Math.min(proj.display.pos.y, global.y);
      global.width = Math.max(proj.display.size.width, global.width);
      global.height = Math.max(proj.display.size.height, global.height);
    }

    // Simply add on top of it
    const pos = { x: global.x, y: global.y - 32 };

    const res = await createProject({
      name,
      slug,
      orgId: params.org_id,
      display: { pos },
    });
    if (isError(res)) {
      if (isValidationError(res)) {
        setErrors(res.error.fields);
      } else {
        message.error(i18n.errorOccurred);
      }
      return;
    }

    message.success('Project created');

    navigate(`/${params.org_id}/${res.slug}`);
  };

  return (
    <form onSubmit={onFinish} className={cls.form}>
      <Typography.Title level={4}>Create Project</Typography.Title>
      <div className={cls.title}>
        <Form.Item
          className={cls.wrap}
          help={errors.name?.message}
          validateStatus={errors.name && 'error'}
        >
          <Input
            size="large"
            placeholder="Project name..."
            className={cls.input}
            value={name}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              const prev = slugify(name);
              if (slug === prev) {
                setSlug(slugify(e.target.value));
              }
            }}
          />
        </Form.Item>
        <Button
          type="primary"
          disabled={!name || name.length < 2}
          className={cls.button}
          htmlType="submit"
          icon={<IconCircleArrowRight />}
        ></Button>
      </div>
      <Form.Item
        className={cls.wrap}
        help={errors.slug?.message}
        validateStatus={errors.slug && 'error'}
      >
        <Input
          placeholder="Unique ID"
          value={slug}
          addonBefore={`https://specify.io/${params.org_id}/`}
          onChange={(e) => setSlug(slugify(e.target.value))}
        />
      </Form.Item>
    </form>
  );
};
