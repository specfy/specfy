import { IconPlus } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useGetGitHubInstallations } from '../../../api';
import { useToast } from '../../../hooks/useToast';
import { AvatarAuto } from '../../AvatarAuto';
import { CommandItem } from '../../Command';
import { Button } from '../../Form/Button';
import type { ComboboxOption } from '../../Form/Combobox';
import { Combobox } from '../../Form/Combobox';

import cls from './index.module.scss';

import { GITHUB_APP } from '@/common/envs';
import { Popup } from '@/common/popup';

export const GitHubOrgSelect: React.FC<{
  defaultSelected?: string;
  disabled?: boolean;
  onChange: (selected: string | undefined) => void;
  onClose?: () => void;
}> = ({ defaultSelected, disabled, onChange, onClose }) => {
  const toast = useToast();
  const ref = useRef<Popup | null>(null);
  const resInstall = useGetGitHubInstallations();
  const [selected, setSelected] = useState<string | undefined>(
    () => defaultSelected
  );
  const [ready, setReady] = useState<boolean>(false);
  const [selectFirst, setSelectFirst] = useState<boolean>(false);

  useEffect(() => {
    if (!resInstall.data || resInstall.isFetching || ready) {
      return;
    }

    // If nothing selected yet (first load)
    // Or the currently selected has been removed
    if (
      !selected ||
      !resInstall.data.find((inst) => String(inst.id) === selected)
    ) {
      setSelected(String(defaultSelected));
    }
    if (
      selectFirst &&
      !selected &&
      !defaultSelected &&
      resInstall.data.length === 1
    ) {
      setSelected(String(resInstall.data[0].id));
    }

    setReady(true);
  }, [resInstall]);

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  const options = useMemo<ComboboxOption[]>(() => {
    if (!resInstall.data!) {
      return [];
    }
    return resInstall.data.map((inst) => {
      return {
        label: inst.name,
        value: String(inst.id),
        icon: (
          <AvatarAuto
            name={inst.name}
            src={inst.avatarUrl}
            shape="square"
            size="s"
          />
        ),
      };
    });
  }, [resInstall]);

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
          setReady(false);
          ref.current = null;
          setSelectFirst(true);
          void resInstall.refetch();

          if (onClose) {
            onClose();
          }
        },
      },
    });
    ref.current.open();
  };

  if (!ready) {
    return <Skeleton width="250px" height="34px" />;
  }

  return (
    <Combobox
      placeholder="Select a GitHub organization"
      options={options}
      value={selected}
      onChange={setSelected}
      className={cls.select}
      disabled={disabled}
      after={
        <CommandItem onSelect={triggerInstall}>
          <Button size="s" display="ghost" onClick={triggerInstall}>
            <IconPlus />
            Add GitHub Organization
          </Button>
        </CommandItem>
      }
    />
  );
};
