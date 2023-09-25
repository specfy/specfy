import { SiGithub } from '@icons-pack/react-simple-icons';
import type { ApiGitHubRepo } from '@specfy/models';
import { IconSelector } from '@tabler/icons-react';
import classNames from 'classnames';
import { forwardRef, useEffect, useRef, useState } from 'react';

import { useGetGitHubRepos } from '../../../api';
import { Input } from '../../Form/Input';
import * as Popover from '../../Popover';

import cls from './index.module.scss';

function getDefault(search: string) {
  return {
    id: -1,
    name: `Create "${search}"`,
    fullName: search,
    url: '',
    private: false,
  };
}
export const GitHubSearch = forwardRef<
  HTMLButtonElement,
  {
    installationId?: number | null;
    onPick: (repo: ApiGitHubRepo) => void;
  }
>(function GitHubSearch({ installationId, onPick }, ref) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<ApiGitHubRepo[]>([]);

  const [focus, setFocus] = useState<number>(0);
  const [search, setSearch] = useState('');
  const refList = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState<ApiGitHubRepo>();

  const res = useGetGitHubRepos(
    {
      installation_id: installationId || undefined,
    },
    Boolean(installationId)
  );
  useEffect(() => {
    if (!res.data) {
      if (search) {
        setList([getDefault(search)]);
      } else {
        setList([]);
      }
      return;
    }

    const reg = new RegExp(`${search}`, 'i');
    let tmp;
    if (!search) {
      tmp = res.data;
    } else {
      tmp = res.data.filter((repo) => reg.test(repo.name));
      tmp.push(getDefault(search));
    }
    setList(tmp);
  }, [search, res.data]);

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      if (focus < list.length - 1) setFocus(focus + 1);
      else setFocus(0);
      return;
    }

    if (e.code === 'ArrowUp') {
      e.preventDefault();
      if (focus !== 0) setFocus(focus - 1);
      // else setFocus(-1);
      return;
    }

    if (e.code === 'Enter') {
      if (list.length <= 0 || focus < 0) {
        return;
      }

      e.preventDefault();
      onPick(list[focus]);
      setPick(list[focus]);
      setOpen(false);
      setSearch('');
      return;
    }
  };

  useEffect(() => {
    const focused = refList.current?.getElementsByClassName(cls.focused);
    if (focused && focused.length > 0) {
      focused[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focus]);

  const onClick = (repo: ApiGitHubRepo) => {
    setSearch(repo.name);
    onPick(repo);
    setPick(repo);
    setOpen(false);
    setSearch('');
  };

  return (
    <div>
      <Popover.Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button ref={ref} className={cls.select}>
            {pick && (
              <div className={cls.pick}>
                {pick.id !== -1 ? (
                  <>
                    <SiGithub size={'1em'} /> {pick.name}{' '}
                  </>
                ) : (
                  pick?.fullName
                )}
              </div>
            )}
            {!pick && 'Select repository...'} <IconSelector />
          </button>
        </Popover.Trigger>
        <Popover.Content className={cls.content} align="start" sideOffset={10}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyPress}
            className={cls.input}
            autoFocus
            placeholder={!installationId ? 'Type Project name' : 'Search...'}
          />
          <div ref={refList} className={cls.list}>
            {list.map((repo, i) => {
              return (
                <div
                  key={repo.id}
                  role="listitem"
                  tabIndex={0}
                  onClick={() => onClick(repo)}
                  className={classNames(cls.row, focus === i && cls.focused)}
                >
                  <div>{repo.name}</div>
                  {repo.url && (
                    <div className={cls.visibility}>
                      {repo.private ? 'Private' : 'Public'} repo
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Popover>
    </div>
  );
});
