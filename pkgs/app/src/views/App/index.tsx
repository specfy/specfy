import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import type React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
// import { ReactQueryDevtools } from 'react-query/devtools';
import { Route, Routes } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';

import { queryClient } from '../../common/query';
import { AuthLayout } from '../../components/AuthLayout';
import { ErrorFallback } from '../../components/ErrorFallback';
import { NotFound } from '../../components/NotFound';
import { ToastProvider } from '../../components/Toast';
import { AuthProvider } from '../../hooks/useAuth';
import { EditProvider } from '../../hooks/useEdit';
import { Account } from '../Account';
import { Homepage } from '../Homepage';
import { Invite } from '../Invite';
import { Login } from '../Login';
import { Org } from '../Org';
import { OrgCreate } from '../Org/Create';
import { Project } from '../Project';

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ToastProvider>
        <AntdApp>
          <ConfigProvider
            theme={{
              token: {
                borderRadius: 4,
                colorPrimary: '#242d3c',
                colorLink: '#1d4ed8',
                colorLinkHover: '#3b82f6',
                // linkHoverDecoration: 'underline',
                fontSizeHeading1: 28,
                fontSizeHeading2: 24,
                fontSizeHeading3: 20,
                fontSizeHeading4: 18,
                fontSizeHeading5: 16,
                fontSize: 14,
                fontFamily: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, BlinkMacSystemFont, Oxygen, "Open Sans", "Helvetica Neue"`,
                colorSuccess: '#059669', // emerald
                colorSuccessBg: '#d1fae5', // emerald
                colorError: '#dc2626',
                colorErrorBg: '#fee2e2',
                colorBgBase: '#fff',
                colorText: '#27272a',
                colorTextSecondary: '#9ca3af',
                colorTextDescription: '#6b7280',
                colorBgContainerDisabled: '#f9fafb',
              },
              components: {
                Table: {
                  controlItemBgHover: 'white',
                  controlItemBgActive: 'white',
                  controlItemBgActiveHover: 'white',
                  colorFillAlter: 'white',
                },
              },
            }}
          >
            <QueryClientProvider client={queryClient}>
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}

              <AuthProvider>
                <ReactFlowProvider>
                  <HelmetProvider>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route element={<AuthLayout></AuthLayout>}>
                        <Route path="/" element={<Homepage />} />

                        <Route path="/invite" element={<Invite />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/organizations" element={<NotFound />} />
                        <Route
                          path="/organizations/*"
                          element={<OrgCreate />}
                        />
                        <Route path="/:org_id/_/*" element={<Org />} />
                        <Route path="/:org_id" element={<Org />} />

                        <Route
                          path="/:org_id/:project_slug/*"
                          element={
                            <EditProvider>
                              <Project />
                            </EditProvider>
                          }
                        />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </HelmetProvider>
                </ReactFlowProvider>
              </AuthProvider>
            </QueryClientProvider>
          </ConfigProvider>
        </AntdApp>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
