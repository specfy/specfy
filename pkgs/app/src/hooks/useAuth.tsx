/* eslint-disable @typescript-eslint/no-empty-function */
import type { ApiMe } from 'api/src/types/api';
import { useMemo, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { getMe } from '../api/users';

interface AuthContextInterface {
  user: ApiMe | null;
  tryLogin: () => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextInterface>({
  user: null,
  tryLogin: () => {},
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<ApiMe | null>(null);

  const tryLogin = async () => {
    const data = await getMe();
    if (!data) return false;
    setUser(data);
    return true;
  };

  const handleLogin = async () => {
    const success = await tryLogin();

    if (!success) return;
    const origin = location.state?.from?.pathname || '/';
    navigate(origin);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      tryLogin: tryLogin,
      login: handleLogin,
      logout: handleLogout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextInterface => {
  return useContext(AuthContext);
};
