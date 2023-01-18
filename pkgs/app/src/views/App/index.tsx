import { Layout } from 'antd';
import type React from 'react';
import { Route, Routes } from 'react-router-dom';

import { LayoutHeader } from '../../components/LayoutHeader';
import { NotFound } from '../../components/NotFound';
import { ComponentView } from '../Component';
import { Home } from '../Home';
import { Project } from '../Project';
import { RFC } from '../RFC';
import { Tech } from '../Tech';

import cls from './index.module.scss';

const App: React.FC = () => {
  return (
    <Layout className={cls.app}>
      <Layout>
        <LayoutHeader></LayoutHeader>
        <Layout.Content>
          <Routes>
            <Route path="/">
              <Route index element={<Home />} />
              <Route path="/p/:projectId" element={<Project />} />
              <Route path="/p/:projectId/rfc/:rfcId" element={<RFC />} />
              <Route path="/t/:techId" element={<Tech />} />
              <Route
                path="/p/:projectId/c/:componentId"
                element={<ComponentView />}
              />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default App;
