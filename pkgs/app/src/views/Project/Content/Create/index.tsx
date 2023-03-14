import { IconCircleArrowRight } from '@tabler/icons-react';
import type { SelectProps } from 'antd';
import { Button, Input, Select, Typography } from 'antd';
import type { ApiDocument } from 'api/src/types/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDocumentsStore, useProjectStore } from '../../../../common/store';
import { useEdit } from '../../../../hooks/useEdit';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectContentCreate: React.FC<{ params: RouteProject }> = ({
  params,
}) => {
  const navigate = useNavigate();
  const storeProject = useProjectStore();
  const storeDocument = useDocumentsStore();
  const edit = useEdit();

  const [options] = useState<SelectProps['options']>(() => {
    return [
      { label: 'RFC', value: 'rfc' },
      { label: 'Playbook', value: 'pb' },
    ];
  });
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<ApiDocument['type']>('rfc');

  const onFinish = async () => {
    const proj = storeProject.project!;
    const doc = storeDocument.create({
      orgId: proj.orgId,
      projectId: proj.id,
      name,
      type,
    });
    edit.enable(true);

    navigate(
      `/${params.org_id}/${params.project_slug}/content/${doc.id}-${doc.slug}`
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onFinish();
      }}
      className={cls.form}
    >
      <Typography.Title level={4}>Create Content</Typography.Title>
      <Select
        options={options}
        size="large"
        className={cls.type}
        value={type}
        onChange={setType}
      />
      <div className={cls.title}>
        <Input
          size="large"
          placeholder="Title..."
          className={cls.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="primary"
          disabled={!name || name.length < 2}
          className={cls.button}
          onClick={onFinish}
          htmlType="submit"
          icon={<IconCircleArrowRight />}
        ></Button>
      </div>
    </form>
  );
};
