import { IconPlus } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useGetGithubRepos } from '../../../api';
import { GITHUB_APP } from '../../../common/envs';
import { Popup } from '../../../common/popup';
import { useToast } from '../../../hooks/useToast';
import { CommandItem } from '../../Command';
import { Button } from '../../Form/Button';
import type { ComboboxOption } from '../../Form/Combobox';
import { Combobox } from '../../Form/Combobox';

import cls from './index.module.scss';

export const GithubRepoSelect: React.FC<{
  installationId: number;
  value: string | undefined;
  onChange: (selected: string | undefined) => void;
}> = ({ value, installationId, onChange }) => {
  const toast = useToast();
  const ref = useRef<Popup | null>(null);
  const [selected, setSelected] = useState<string | undefined>();
  const res = useGetGithubRepos(
    {
      installation_id: installationId,
    },
    true
  );

  const options = useMemo<ComboboxOption[]>(() => {
    if (!res.data!) {
      return [];
    }
    return res.data.map((repo) => {
      return { label: repo.name, value: String(repo.id) };
    });
  }, [res.data]);

  useEffect(() => {
    if (!res.data) {
      return;
    }
    setSelected(
      value ? String(res.data.find((v) => v.fullName === value)!.id) : undefined
    );
  }, [value]);

  useEffect(() => {
    if (!selected) {
      return;
    }

    onChange(res.data!.find((v) => String(v.id) === selected)?.fullName);
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
    return <Skeleton width="250px" height="34px" />;
  }

  return (
    <Combobox
      placeholder="Select a Github repository"
      options={options}
      value={selected}
      onChange={setSelected}
      className={cls.select}
      after={
        <CommandItem onSelect={triggerInstall}>
          <Button size="s" display="ghost" onClick={triggerInstall}>
            <IconPlus />
            Install more repositories
          </Button>
        </CommandItem>
      }
    />
  );
};
