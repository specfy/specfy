import { LoadingOutlined } from '@ant-design/icons';
import {
  IconCheck,
  IconCircleArrowRight,
  IconLock,
  IconPlus,
} from '@tabler/icons-react';
import { App, Avatar, Button, Form, Input, Select } from 'antd';
import { hDef, wDef, wMax } from 'api/src/common/validators/flow.constants';
import type { ApiGithubRepo, FieldsErrors } from 'api/src/types/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createProject } from '../../../api';
import {
  useGetGithubInstallations,
  useGetGithubRepos,
} from '../../../api/github';
import { isError, isValidationError } from '../../../api/helpers';
import { computeProjectPosition, computeWidth } from '../../../common/flow';
import { i18n } from '../../../common/i18n';
import { Popup } from '../../../common/popup';
import { queryClient } from '../../../common/query';
import { useProjectStore } from '../../../common/store';
import { slugify } from '../../../common/string';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const Repo: React.FC<{
  repo: ApiGithubRepo;
  onQuickCreate: (repo: ApiGithubRepo) => Promise<boolean>;
}> = ({ repo, onQuickCreate }) => {
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className={cls.item}>
      <div>
        {repo.name} {repo.private && <IconLock />}
      </div>
      <Button
        onClick={async () => {
          setLoading(true);
          const done = await onQuickCreate(repo);
          setLoading(false);
          setCreated(done);
        }}
        loading={loading}
        disabled={created}
      >
        {created ? (
          <>
            <IconCheck /> created
          </>
        ) : (
          'Quick create'
        )}
      </Button>
    </div>
  );
};

export const ProjectCreate: React.FC<{ params: RouteOrg }> = ({ params }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const storeProjects = useProjectStore();

  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [errors, setErrors] = useState<FieldsErrors>({});

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await createProject({
      name,
      slug,
      orgId: params.org_id,
      display: {
        pos: computeProjectPosition(storeProjects.projects),
        zIndex: 1,
        size: { width: computeWidth(name, wDef, wMax), height: hDef },
      },
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

  // Github
  const ref = useRef<Popup | null>(null);
  const [selected, setSelected] = useState<number | 'public'>('public');
  const [githubReady, setGithubReady] = useState<boolean>(false);

  const resInstall = useGetGithubInstallations();
  const resRepos = useGetGithubRepos(
    {
      installation_id: selected === 'public' ? undefined : selected,
    },
    resInstall.data !== null
  );

  useEffect(() => {
    if (!resInstall.data) {
      return;
    }

    const curr = resInstall.data.length > 0 ? resInstall.data[0] : undefined;
    // If nothing selected yet (first load)
    // Or the currently selected has been removed
    if (!selected || !resInstall.data.find((inst) => inst.id === selected)) {
      setSelected(curr?.id || 'public');
    }
  }, [resInstall.data]);

  useEffect(() => {
    if (!resRepos.data) {
      return;
    }

    setGithubReady(true);
  }, [resRepos.data]);

  const triggerInstall = () => {
    ref.current = new Popup({
      id: 'github-install',
      url: 'https://github.com/apps/specfy-local/installations/new',
      callbacks: {
        onBlocked: () => {
          ref.current = null;
          message.error(
            'The popup to install the GitHub App could not be opened.'
          );
        },
        onAbort: () => {
          ref.current = null;
          console.log('on abort');
        },
        onClose: () => {
          ref.current = null;
          queryClient.refetchQueries(['getGithubInstallations'], {
            exact: false,
          });
          queryClient.refetchQueries(['getGithubRepos'], {
            exact: false,
          });
          console.log('on clear');
        },
        onPoll: async (popup) => {
          // TODO: fails locally because of CSP that are not sent
          try {
            const url = new URL(popup.location.href);

            if (
              url.origin !== window.location.origin ||
              url.pathname !== '/0/auth/github/cb'
            ) {
              return;
            }

            if (ref.current) {
              ref.current.close();
            }

            const tmp = Number(url.searchParams.get('installation_id'));
            setSelected(tmp);
          } catch (e) {
            console.error(e);
            // do nothing
          }

          // TODO: do something here
        },
      },
    });
    ref.current.open();
  };

  const onQuickCreate = useCallback(
    async (repo: ApiGithubRepo): Promise<boolean> => {
      const tmpSlug = slugify(repo.name);
      const res = await createProject({
        name: repo.name,
        slug: tmpSlug,
        orgId: params.org_id,
        display: {
          pos: computeProjectPosition(storeProjects.projects),
          zIndex: 1,
          size: { width: computeWidth(repo.name, wDef, wMax), height: hDef },
        },
      });
      if (isError(res)) {
        if (isValidationError(res)) {
          setName(repo.name);
          setSlug(tmpSlug);
          setErrors(res.error.fields);

          window.scrollTo(0, 0);
        } else {
          message.error(i18n.errorOccurred);
        }
        return false;
      }

      message.success('Project created');

      return true;
    },
    [storeProjects.projects]
  );

  return (
    <div className={cls.container}>
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
            addonBefore={`https://app.specify.io/${params.org_id}/`}
            onChange={(e) => setSlug(slugify(e.target.value))}
          />
        </Form.Item>
      </form>
      <div className={cls.github}>
        <header>
          <h3>Quick create from Github</h3>
        </header>
        {!githubReady ? (
          <LoadingOutlined />
        ) : (
          <div>
            <Select
              className={cls.select}
              value={selected}
              size="large"
              onChange={setSelected}
              dropdownRender={(menu) => {
                return (
                  <>
                    {menu}

                    <div className={cls.install}>
                      <Button
                        icon={<IconPlus />}
                        type="ghost"
                        onClick={triggerInstall}
                      >
                        Add Github Organization
                      </Button>
                    </div>
                  </>
                );
              }}
            >
              <Select.Option value="public">
                <div> </div>
                <div className={cls.label}>Public Repositories</div>
              </Select.Option>
              {resInstall.data!.map((install) => {
                return (
                  <Select.Option key={install.id} value={install.id}>
                    <div className={cls.option}>
                      <Avatar
                        src={install.avatar}
                        shape="square"
                        size="small"
                      />
                      <div className={cls.label}>{install.name}</div>
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
            <div>
              {resRepos.data?.map((repo) => {
                return (
                  <Repo
                    key={repo.id}
                    repo={repo}
                    onQuickCreate={onQuickCreate}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
