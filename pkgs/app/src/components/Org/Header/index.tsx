import {
  IconApps,
  IconChevronDown,
  IconHome,
  IconListSearch,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import classNames from 'classnames';
import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';

import type { ApiOrg } from '@specfy/models';

import { useListOrgs } from '@/api';
import { isError } from '@/api/helpers';
import { useOrgStore } from '@/common/store';
import { AvatarAuto } from '@/components/AvatarAuto';
import * as Dropdown from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import * as Menu from '@/components/Menu';
import { Tag } from '@/components/Tag';
import type { RouteOrg } from '@/types/routes';

import cls from './index.module.scss';

export const OrgSwitcher: React.FC = () => {
  const storeOrg = useOrgStore();

  const params = useParams<Partial<RouteOrg>>();
  const orgsQuery = useListOrgs();
  const [current, setCurrent] = useState<ApiOrg>();

  useEffect(() => {
    if (!orgsQuery.data) {
      return;
    }

    storeOrg.fill(orgsQuery.data.data);
  }, [orgsQuery.data]);

  useEffect(() => {
    if (!orgsQuery.data || isError(orgsQuery.data)) {
      return;
    }

    for (const org of orgsQuery.data.data) {
      if (org.id === params.org_id) {
        setCurrent(org);
        storeOrg.setCurrent(org);
        return;
      }
    }
  }, [orgsQuery.data, params.org_id]);

  if (!current) {
    return null;
  }

  return (
    <div>
      <Dropdown.Menu>
        <Dropdown.Trigger asChild>
          <button className={cls.switcher}>
            <div className={cls.name}>
              <AvatarAuto org={current} size="s" />
              {current.name}
            </div>
            <IconChevronDown />
          </button>
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Group>
            {orgsQuery.data?.data.map((org) => {
              return (
                <Dropdown.Item key={org.id} asChild>
                  <Link
                    to={`/${org.id}`}
                    className={classNames(
                      cls.org,
                      current.id === org.id && cls.current
                    )}
                  >
                    <AvatarAuto org={org} size="s" /> {org.name}
                  </Link>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Group>
          <Dropdown.Separator />
          <Dropdown.Group>
            <Dropdown.Item asChild>
              <Link to="/organizations/new" className={cls.org}>
                <IconPlus size="1em" />
                Create organization
              </Link>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Menu>
    </div>
  );
};

export const OrgMenu: React.FC = () => {
  const params = useParams<Partial<RouteOrg>>() as RouteOrg;
  const location = useLocation();

  const [open, setOpen] = useState<string | null>(null);
  const linkSelf = useMemo(() => {
    return `/${params.org_id}`;
  }, [params]);

  useEffect(() => {
    const path = location.pathname.split('/');
    if (path.length > 2 && path[2] !== '_') {
      setOpen(null);
      return;
    }

    if (path[3] === 'flow') {
      setOpen('flow');
    } else if (path[3] === 'catalog') {
      setOpen('catalog');
    } else if (path[3] === 'settings') {
      setOpen('settings');
    } else if (path[3] === 'team') {
      setOpen('team');
    } else {
      setOpen('home');
    }
  }, [location]);

  const menu = useMemo(() => {
    return [
      {
        key: 'home',
        label: (
          <Link to={linkSelf}>
            <Flex gap="l">
              <IconHome />
              Home
            </Flex>
          </Link>
        ),
      },
      {
        key: 'flow',
        label: (
          <Link to={`${linkSelf}/_/flow`}>
            <Flex gap="l">
              <IconApps />
              Flow
            </Flex>
          </Link>
        ),
      },
      {
        key: 'catalog',
        label: (
          <Link to={`${linkSelf}/_/catalog`}>
            <Flex justify="space-between" grow={1}>
              <Flex gap="l">
                <IconListSearch />
                Catalog
              </Flex>
              <Tag size="s" variant="light">
                new
              </Tag>
            </Flex>
          </Link>
        ),
      },
      {
        key: 'settings',
        label: (
          <Link to={`${linkSelf}/_/settings`}>
            <Flex gap="l">
              <IconSettings />
              Settings
            </Flex>
          </Link>
        ),
      },
    ];
  }, [linkSelf]);

  return (
    <>
      <Menu.Menu orientation="vertical">
        <Menu.List>
          {menu.map((item) => {
            return (
              <Menu.Item key={item.key}>
                <Menu.Link asChild active={open === item.key}>
                  {item.label}
                </Menu.Link>
              </Menu.Item>
            );
          })}
        </Menu.List>
      </Menu.Menu>
    </>
  );
};
