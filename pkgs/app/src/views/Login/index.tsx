import { useMount } from 'react-use';

import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
  const { login } = useAuth();

  useMount(() => {
    login();
  });

  return <div>login batard</div>;
};
