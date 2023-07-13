import { IconPlus } from '@tabler/icons-react';
import { Button, Select, Skeleton } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { useGetGithubRepos } from '../../../api';
import { GITHUB_APP } from '../../../common/envs';
import { Popup } from '../../../common/popup';
import { useToast } from '../../../hooks/useToast';

import cls from './index.module.scss';

export const GithubRepoSelect: React.FC<{
  installationId: number;
  defaultSelected: string | null;
  emptyOption?: boolean;
  onChange: (selected: string | null) => void;
}> = ({ defaultSelected, installationId, emptyOption, onChange }) => {
  const toast = useToast();
  const ref = useRef<Popup | null>(null);
  const [selected, setSelected] = useState<string | null>(
    defaultSelected || null
  );
  const res = useGetGithubRepos(
    {
      installation_id: installationId,
    },
    true
  );

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  const triggerInstall = () => {
    ref.current = new Popup({
      id: 'github-install',
      url: `https://github.com/apps/${GITHUB_APP}/installations/new`,
      callbacks: {
        onBlocked: () => {
          ref.current = null;
          toast.add({
            title: 'The popup to install the GitHub App could not be opened.',
            status: 'error',
          });
        },
        onClose: () => {
          ref.current = null;
          void res.refetch();
        },
      },
    });
    ref.current.open();
  };

  if (res.isFetching) {
    return <Skeleton.Input active style={{ width: '250px', height: '40px' }} />;
  }

  return (
    <Select
      className={cls.select}
      value={selected}
      size="large"
      onChange={setSelected}
      notFoundContent={<></>}
      dropdownRender={(menu) => {
        return (
          <>
            {menu}

            <div className={cls.install}>
              <Button icon={<IconPlus />} type="ghost" onClick={triggerInstall}>
                Install more repositories
              </Button>
            </div>
          </>
        );
      }}
    >
      {emptyOption && !selected && (
        <Select.Option>Select a repository</Select.Option>
      )}
      {res.data!.map((repo) => {
        return (
          <Select.Option key={repo.fullName} value={repo.fullName}>
            <div className={cls.option}>
              <div>{repo.name}</div>
            </div>
          </Select.Option>
        );
      })}
    </Select>
  );
};
