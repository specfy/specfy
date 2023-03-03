import { App as AntdApp, ConfigProvider } from 'antd';
import type React from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Navigate, Route, Routes } from 'react-router-dom';

import { queryClient } from '../../common/query';
import { AuthLayout } from '../../components/AuthLayout';
import { NotFound } from '../../components/NotFound';
import { AuthProvider } from '../../hooks/useAuth';
import { EditProvider } from '../../hooks/useEdit';
import { GraphProvider } from '../../hooks/useGraph';
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
            colorPrimary: '#4f46e5',
            colorLinkHover: '#1d4ed8',
            // linkHoverDecoration: 'underline',
            fontSizeHeading1: 28,
            fontSizeHeading2: 24,
            fontSizeHeading3: 20,
            fontSizeHeading4: 18,
            fontSizeHeading5: 16,
            fontSize: 14,
            fontFamily: `"Source Sans Pro", system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, BlinkMacSystemFont, Oxygen, "Open Sans", "Helvetica Neue"`,
            colorSuccess: '#059669', // emerald
            colorSuccessBg: '#d1fae5', // emerald
            colorError: '#dc2626',
            colorErrorBg: '#fee2e2',
            colorBgBase: '#fff',
            colorTextSecondary: '#9ca3af',
            colorTextDescription: '#6b7280',
            colorBgContainerDisabled: '#f9fafb',
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AuthLayout></AuthLayout>}>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/org/:org_id" element={<Home />} />
                <Route path="/new/project" element={<ProjectCreate />} />

                <Route
                  path="/org/:org_id/:project_slug/*"
                  element={
                    <GraphProvider>
                      <EditProvider>
                        <Project />
                      </EditProvider>
                    </GraphProvider>
                  }
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
