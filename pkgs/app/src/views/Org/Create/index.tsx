import { IconCircleArrowRight } from '@tabler/icons-react';
import { App, Button, Input, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createOrg } from '../../../api/orgs';
import { slugify } from '../../../common/string';

import cls from './index.module.scss';

export const OrgCreate: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [id, setId] = useState<string>('');

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await createOrg({
      id,
      name,
    });
    message.success('Organization created');

    navigate(`/${res.id}`);
  };

  return (
    <form onSubmit={onFinish} className={cls.form}>
      <Typography.Title level={4}>Create Organization</Typography.Title>
      <div className={cls.title}>
        <Input
          size="large"
          placeholder="Name"
          className={cls.input}
          value={name}
          autoFocus
          onChange={(e) => {
            setName(e.target.value);
            const prevId = slugify(name);
            if (id === prevId) {
              setId(slugify(e.target.value));
            }
          }}
        />
        <Button
          type="primary"
          disabled={!name || name.length < 4 || !id || id.length < 4}
          className={cls.button}
          htmlType="submit"
          icon={<IconCircleArrowRight />}
        ></Button>
      </div>
      <Input
        placeholder="Unique ID"
        value={id}
        addonBefore="https://specify.io/"
        onChange={(e) => setId(e.target.value)}
      />
    </form>
  );
};
