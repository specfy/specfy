import { TooltipProvider } from '@radix-ui/react-tooltip';
import { QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
// import { ReactQueryDevtools } from 'react-query/devtools';
import { Route, Routes } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';

import { qcli } from '../../common/query';
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
import { Onboarding } from '../Onboarding';
import { Org } from '../Org';
import { OrgCreate } from '../Org/Create';
import { Project } from '../Project';
import { Public } from '../Public';
import { User } from '../User';

const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ToastProvider>
        <TooltipProvider>
          <QueryClientProvider client={qcli}>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}

            <AuthProvider>
              <ReactFlowProvider>
                <HelmetProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/public" element={<Public />} />
                    <Route element={<AuthLayout></AuthLayout>}>
                      <Route path="/" element={<Homepage />} />
                      <Route path="/onboarding" element={<Onboarding />} />

                      <Route path="/invite" element={<Invite />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/organizations" element={<NotFound />} />
                      <Route path="/user/*" element={<User />} />
                      <Route path="/organizations/*" element={<OrgCreate />} />
                      <Route path="/:org_id/_?/*" element={<Org />} />
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
        </TooltipProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
