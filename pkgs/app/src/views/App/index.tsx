import { App as AntdApp, ConfigProvider } from 'antd';
import type React from 'react';
import { QueryClientProvider } from 'react-query';
import { Navigate, Route, Routes } from 'react-router-dom';

import { queryClient } from '../../common/query';
import { AuthLayout } from '../../components/AuthLayout';
import { NotFound } from '../../components/NotFound';
import { AuthProvider } from '../../hooks/useAuth';
import { Home } from '../Home';
import { Login } from '../Login';
import { Project } from '../Project';
import { ProjectCreate } from '../Project/Create';

const HomeRedirect: React.FC = () => {
  return <Navigate to={'/org/algolia'}></Navigate>;
};

const App: React.FC = () => {
  return (
    <AntdApp>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 4,
            colorPrimary: '#2a74dc',
            colorLinkHover: '#2a74dc',
            linkHoverDecoration: 'underline',
            fontSizeHeading1: 28,
            fontSizeHeading2: 24,
            fontSizeHeading5: 16,
            fontSizeHeading4: 18,
            fontSizeHeading3: 20,
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AuthLayout></AuthLayout>}>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/org/:org_id" element={<Home />} />
                <Route path="/new/project" element={<ProjectCreate />} />

                <Route
                  path="/org/:org_id/:project_slug/*"
                  element={<Project />}
                />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </AntdApp>
  );
};

export default App;
