/* eslint-disable @typescript-eslint/no-empty-function */
import type { ApiMe } from '@specfy/models';
import { useMemo, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { getMe } from '../api/me';

interface AuthContextInterface {
  user: ApiMe | null;
  currentPerm: ApiMe['perms'][0] | null;
  tryLogin: () => Promise<boolean>;
  login: () => void;
  logout: () => void;
  setCtx: (ctx: { orgId?: string; projectId?: string }) => void;
}

const AuthContext = createContext<AuthContextInterface>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<ApiMe | null>(null);
  const [ctx, setCtx] = useState<{ orgId?: string; projectId?: string }>({});

  const tryLogin = async () => {
    const data = await getMe();
    if (!data) {
      return false;
    }

    setUser(data);
    return true;
  };

  const handleLogin = async () => {
    const success = await tryLogin();

    if (!success) {
      return;
    }
    const origin = location.state?.from?.pathname || '/';
    navigate(origin);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };
  const currentPerm = useMemo(() => {
    if (!user) {
      return null;
    }
    if (!ctx.orgId) {
      return null;
    }

    const org = user.perms.find(
      (perm) => perm.orgId === ctx.orgId && perm.projectId === null
    );
    if (org?.role === 'owner') {
      return org;
    }

    if (ctx.projectId) {
      const proj = user.perms.find(
        (perm) => perm.orgId === ctx.orgId && perm.projectId === ctx.projectId
      );
      if (proj) {
        return proj;
      }
    }
    return org || null;
  }, [user, ctx]);

  const value = useMemo(() => {
    return {
      user,
      currentPerm,
      tryLogin: tryLogin,
      login: handleLogin,
      logout: handleLogout,
      setCtx,
    };
  }, [user, currentPerm]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextInterface => {
  return useContext(AuthContext);
};
