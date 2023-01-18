import type React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes } from 'react-router-dom';

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

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthLayout></AuthLayout>}>
            <Route path="/" element={<Home />} />
            <Route path="/new/project" element={<ProjectCreate />} />
            <Route path="/t/:techId" element={<Tech />} />

            <Route path="/p/:projectId" element={<Project />} />
            <Route path="/p/:projectId/rfc/:rfcId" element={<RFC />} />
            <Route
              path="/p/:projectId/c/:componentId"
              element={<ComponentView />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
