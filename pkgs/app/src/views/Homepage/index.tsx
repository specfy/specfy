import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';

import { useListOrgs } from '../../api';

export const Homepage: React.FC = () => {
  const orgsQuery = useListOrgs();

  const redirect = useMemo(() => {
    if (!orgsQuery.data) {
      return;
    }

    return orgsQuery.data.length > 0 ? orgsQuery.data[0] : null;
  }, [orgsQuery.data]);

  if (!redirect) {
    return null;
  }

  return <Navigate to={`/${redirect.id}`}></Navigate>;
};
