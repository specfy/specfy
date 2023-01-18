/* eslint-disable @typescript-eslint/no-empty-function */
import { useMemo, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { getMe } from '../api/user';
import type { Me } from '../types/me';

interface AuthContextInterface {
  user: Me | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextInterface>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<Me | null>(null);

  const handleLogin = async () => {
    const data = await getMe();

    setUser(data);

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
