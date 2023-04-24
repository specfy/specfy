import { IconPlus } from '@tabler/icons-react';
import { Button } from 'antd';
import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { useListOrgs } from '../../api';

import cls from './index.module.scss';

export const Homepage: React.FC = () => {
  const orgsQuery = useListOrgs();
  const [lastOrg] = useLocalStorage<string>('lastOrg');

  const redirect = useMemo(() => {
    if (!orgsQuery.data || orgsQuery.data.data.length <= 0) {
      return;
    }

    if (lastOrg) {
      const find = orgsQuery.data.data.find((org) => org.id == lastOrg);
      if (find) {
        return find;
      }
    }

    const first = orgsQuery.data.data[0];
    return first;
  }, [orgsQuery.data]);

  if (orgsQuery.isLoading) {
    return null;
  }

  if (!redirect) {
    return (
      <div className={cls.empty}>
        <Link to="/organizations/new">
          <Button type="default" icon={<IconPlus />}>
            Create an organization
          </Button>
        </Link>
      </div>
    );
  }

  return <Navigate to={`/${redirect.id}`}></Navigate>;
};
