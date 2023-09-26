import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { useListOrgs } from '@/api';

const Homepage: React.FC = () => {
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
    return <Navigate to={`/onboarding`}></Navigate>;
  }

  return <Navigate to={`/${redirect.id}`}></Navigate>;
};

export default Homepage;
