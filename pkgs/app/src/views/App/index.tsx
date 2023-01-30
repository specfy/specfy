import { App as AntdApp } from 'antd';
import type React from 'react';
import { QueryClientProvider } from 'react-query';
import { Navigate, Route, Routes } from 'react-router-dom';

import { queryClient } from '../../common/query';
import { AuthLayout } from '../../components/AuthLayout';
import { NotFound } from '../../components/NotFound';
import { AuthProvider } from '../../hooks/useAuth';
import { ComponentView } from '../Component';
import { Home } from '../Home';
import { Login } from '../Login';
import { Project } from '../Project';
import { ProjectCreate } from '../ProjectCreate';
import { RFC } from '../RFC';
import { Tech } from '../Tech';

const HomeRedirect: React.FC = () => {
  return <Navigate to={'/org/algolia'}></Navigate>;
};

const App: React.FC = () => {
  return (
    <AntdApp>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AuthLayout></AuthLayout>}>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/org/:orgId" element={<Home />} />
              <Route path="/new/project" element={<ProjectCreate />} />

              <Route path="/org/:orgId/:projectSlug" element={<Project />} />
              <Route
                path="/org/:orgId/:projectSlug/t/:techSlug"
                element={<Tech />}
              />
              <Route
                path="/org/:orgId/:projectSlug/rfc/:documentTypeId/:documentSlug"
                element={<RFC />}
              />
              <Route
                path="/org/:orgId/:projectSlug/c/:componentSlug"
                element={<ComponentView />}
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </AntdApp>
  );
};

export default App;
