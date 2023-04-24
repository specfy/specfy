import { IconPlus } from '@tabler/icons-react';
import { Button } from 'antd';
import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useListOrgs } from '../../api';

import cls from './index.module.scss';

export const Homepage: React.FC = () => {
  const orgsQuery = useListOrgs();

  const redirect = useMemo(() => {
    if (!orgsQuery.data) {
      return;
    }

    return orgsQuery.data.data.length > 0 ? orgsQuery.data.data[0] : null;
  }, [orgsQuery.data]);

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
