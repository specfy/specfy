import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Col, Layout, Menu, MenuProps, Select } from 'antd';
import React from 'react';

import cls from './index.module.scss';
import { Home } from '../Home';
import { Route, Routes } from 'react-router-dom';
import { NotFound } from '../../components/NotFound';

const { Header, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: 'home',
    label: <a href="/">Home</a>,
  },
];

const App: React.FC = () => {
  return (
    <Layout className={cls.app}>
      <Layout>
        <Header className={cls.header}>
          <div className={cls.logo}></div>

          <Menu
            className={cls.menu}
            items={menuItems}
            selectedKeys={['home']}
            mode="horizontal"
          ></Menu>

          <div className={cls.headerRight}>
            <div>
              <Select
                defaultValue="Default Org"
                style={{ width: 120 }}
                size="middle"
                options={[
                  {
                    value: 'default',
                    label: 'Default Org',
                  },
                ]}
              />
            </div>
            <div>
              <Avatar size="default" icon={<UserOutlined />} />
            </div>
          </div>
        </Header>
        <Content>
          <Routes>
            <Route path="/">
              <Route index element={<Home />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
