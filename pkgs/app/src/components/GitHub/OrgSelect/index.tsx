import { SiGithub } from '@icons-pack/react-simple-icons';
import { IconCheck } from '@tabler/icons-react';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useGetGitHubInstallations } from '@/api';
import { GITHUB_APP } from '@/common/envs';
import { Popup } from '@/common/popup';
import { AvatarAuto } from '@/components/AvatarAuto';
import { CommandItem } from '@/components/Command';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { Combobox } from '@/components/Form/Combobox';
import type { ComboboxOption } from '@/components/Form/Combobox';
import { useToast } from '@/hooks/useToast';

import cls from './index.module.scss';

export const GitHubButton: React.FC<{
  as?: 'combobox' | 'button';
  hasInstall: boolean;
  onRefresh: () => void;
}> = ({ as = 'button', hasInstall, onRefresh }) => {
  const toast = useToast();
  const ref = useRef<Popup | null>(null);
  const triggerInstall = (e: any) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
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
          onRefresh();
        },
      },
    });
    ref.current.open();
  };

  if (as === 'combobox') {
    return (
      <CommandItem onSelect={triggerInstall}>
        <SiGithub size="1em" />
        {hasInstall ? 'Update GitHub permissions' : 'Install GitHub App'}
      </CommandItem>
    );
  }
  return (
    <Button display={hasInstall ? 'ghost' : 'default'} onClick={triggerInstall}>
      <SiGithub size="1em" />
      {hasInstall ? 'Update GitHub permissions' : 'Install GitHub App'}
    </Button>
  );
};

export const GitHubOrgSelect: React.FC<{
  defaultSelected?: string;
  disabled?: boolean;
  as?: 'list' | 'combobox';
  onChange: (selected: string | undefined) => void;
  onClose?: () => void;
}> = ({ defaultSelected, disabled, as = 'combobox', onChange, onClose }) => {
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
    if (!resInstall.data! || false) {
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

  const onRefresh = () => {
    setReady(false);
    setSelectFirst(true);
    void resInstall.refetch();

    if (onClose) {
      onClose();
    }
  };

  if (!ready) {
    return <Skeleton width="250px" height="34px" />;
  }

  if (as === 'combobox') {
    return (
      <Combobox
        placeholder="Select a GitHub organization"
        options={options}
        value={selected}
        onChange={setSelected}
        className={cls.select}
        disabled={disabled}
        after={
          <GitHubButton
            as="combobox"
            hasInstall={options.length > 0}
            onRefresh={onRefresh}
          />
        }
      />
    );
  }

  return (
    <Flex gap="m" column align="flex-start">
      {options.map((item) => {
        return (
          <button
            key={item.value}
            className={classNames(
              cls.listItem,
              item.value === selected && cls.selected
            )}
            onClick={(e) => {
              e.preventDefault();
              setSelected(item.value);
            }}
          >
            <Flex justify="space-between">
              <Flex gap="m">
                {item.icon}
                {item.label}
              </Flex>
              {item.value === selected && <IconCheck />}
            </Flex>
          </button>
        );
      })}
    </Flex>
  );
};
