/* eslint-disable @typescript-eslint/no-empty-function */
import { useMemo, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import type { ApiMe } from '@specfy/models';

import { logout } from '@/api';
import { getMe } from '@/api/me';

interface CTX {
  orgId?: string;
  projectId?: string;
}
interface AuthContextInterface {
  user: ApiMe | null;
  ctx: CTX;
  currentPerm: ApiMe['perms'][0] | null;
  tryLogin: () => Promise<boolean>;
  login: () => void;
  logout: () => Promise<void>;
  setCtx: (ctx: CTX) => void;
}

const AuthContext = createContext<AuthContextInterface>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<ApiMe | null>(null);
  const [ctx, setCtx] = useState<CTX>({});

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

  const handleLogout = async () => {
    setUser(null);
    await logout();
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
      ctx,
      currentPerm,
      tryLogin: tryLogin,
      login: handleLogin,
      logout: handleLogout,
      setCtx,
    };
  }, [user, currentPerm, ctx]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextInterface => {
  return useContext(AuthContext);
};
