import {
  IconCaretDown,
  IconHelp,
  IconLogout,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useListOrgs } from '../../api';
import { logout } from '../../api/auth';
import { isError } from '../../api/helpers';
import { i18n } from '../../common/i18n';
import { useOrgStore } from '../../common/store';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import type { RouteOrg } from '../../types/routes';
import { AvatarAuto } from '../AvatarAuto';
import * as Dropdown from '../Dropdown';
import { Button } from '../Form/Button';
import { Logo } from '../Logo';

import cls from './index.module.scss';

export const LayoutHeader: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const storeOrg = useOrgStore();

  const params = useParams<Partial<RouteOrg>>();
  const { user } = useAuth();
  const orgsQuery = useListOrgs();
  const [current, setCurrent] = useState<string>();

  const handleLogout = async () => {
    const res = await logout();
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    navigate(`/login`);
  };

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
        setCurrent(org.id);
        storeOrg.setCurrent(org);
        return;
      }
    }
  }, [orgsQuery.data, params.org_id]);

  return (
    <div className={cls.header}>
      <Link to="/" className={cls.logo}>
        <Logo color="white" />
      </Link>

      <div>
        <Dropdown.Menu>
          <Dropdown.Trigger asChild>
            <Button display="ghost">
              <IconCaretDown />
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content>
              <Dropdown.Group>
                {orgsQuery.data?.data.map((org) => {
                  return (
                    <Dropdown.Item key={org.id} asChild>
                      <Link
                        to={`/${org.id}`}
                        className={classNames(
                          cls.org,
                          current === org.id,
                          cls.current
                        )}
                      >
                        <AvatarAuto org={org} /> {org.name}
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
          </Dropdown.Portal>
        </Dropdown.Menu>
      </div>

      <div></div>

      <div className={cls.right}>
        <div>
          <Dropdown.Menu>
            <Dropdown.Trigger asChild>
              <button>
                <AvatarAuto user={user!} />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content>
                <div className={cls.userDropdown}>
                  <div>{user!.name}</div>
                  <strong>{user!.email}</strong>
                </div>

                <Dropdown.Separator />
                <Dropdown.Group>
                  <Dropdown.Item asChild>
                    <Link to="/account/">
                      <IconSettings />
                      <div>Settings</div>
                    </Link>
                  </Dropdown.Item>

                  <Dropdown.Item asChild>
                    <Link to="/account/">
                      <IconHelp />
                      <div>Support</div>
                    </Link>
                  </Dropdown.Item>
                </Dropdown.Group>

                <Dropdown.Separator />

                <Dropdown.Group>
                  <Dropdown.Item asChild>
                    <button onClick={handleLogout}>
                      <IconLogout />
                      <div>Logout</div>
                    </button>
                  </Dropdown.Item>
                </Dropdown.Group>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Menu>
        </div>
      </div>
    </div>
  );
};
