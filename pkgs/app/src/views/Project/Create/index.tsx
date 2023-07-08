import type { ApiOrg, FieldsErrors } from '@specfy/api/src/types/api';
import { IconCircleArrowRight } from '@tabler/icons-react';
import { App, Button, Form, Input } from 'antd';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { createProject } from '../../../api';
import { isError, isValidationError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { slugify, titleSuffix } from '../../../common/string';
import { Card } from '../../../components/Card';
import type { RouteOrg } from '../../../types/routes';

import { CreateFromGithub } from './CreateFromGithub';
import cls from './index.module.scss';

export const ProjectCreate: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [errors, setErrors] = useState<FieldsErrors>({});

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await createProject({
      name,
      slug,
      orgId: params.org_id,
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

  const onError: React.ComponentProps<typeof CreateFromGithub>['onError'] = (
    repo,
    err
  ) => {
    setSlug(slugify(repo.name));
    setName(repo.name);
    setErrors(err.fields);
  };

  return (
    <div className={cls.container}>
      <Helmet title={`Create Project ${titleSuffix}`} />
      <Card padded large>
        <form onSubmit={onFinish} className={cls.form}>
          <header>
            <h1>Create a Project</h1>
            <p>
              Contains your documentation and technical stack about a product in
              your organization.
            </p>
          </header>
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
                  if (slug === prev || slug === '') {
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
              addonBefore={`https://app.specify.io/${params.org_id}/`}
              onChange={(e) => setSlug(slugify(e.target.value))}
            />
          </Form.Item>
        </form>
      </Card>

      <CreateFromGithub org={org} onError={onError} />
    </div>
  );
};
