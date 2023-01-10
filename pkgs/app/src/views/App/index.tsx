import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Col, Layout, Menu, MenuProps, Row, Select } from 'antd';
import React from 'react';

import cls from './index.module.scss';
import { Home } from '../Home';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: 'home',
    icon: React.createElement(HomeOutlined),
    label: <a href="/">Home</a>,
  },
];

const App: React.FC = () => {
  return (
    <Layout className={cls.app}>
      <Sider theme="light">
        <div className={cls.logo}></div>
        <Menu items={menuItems}></Menu>
      </Sider>
      <Layout>
        <Header className={cls.header}>
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
        </Header>
        <Content>
          <Home></Home>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
